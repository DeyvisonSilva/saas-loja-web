import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar se email já existe
    const existingEmail = await this.prisma.tenant.findUnique({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Verificar se subdomínio já existe
    const existingSubdomain = await this.prisma.tenant.findUnique({
      where: { subdomain: registerDto.subdomain },
    });
    if (existingSubdomain) {
      throw new ConflictException('Subdomínio já está em uso');
    }

    // Validar senha
    if (!registerDto.password || registerDto.password.length < 6) {
      throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: registerDto.name,
        subdomain: registerDto.subdomain,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        plan: 'basic',
        isActive: true,
      },
    });

    // Gerar token JWT
    const token = this.jwtService.sign({
      sub: tenant.id,
      email: tenant.email,
      subdomain: tenant.subdomain,
    });

    return {
      token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        subdomain: tenant.subdomain,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar tenant pelo email
    const tenant = await this.prisma.tenant.findUnique({
      where: { email: loginDto.email },
    });

    if (!tenant) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(loginDto.password, tenant.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // Gerar token JWT
    const token = this.jwtService.sign({
      sub: tenant.id,
      email: tenant.email,
      subdomain: tenant.subdomain,
    });

    return {
      token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        subdomain: tenant.subdomain,
      },
    };
  }

  async validateTenant(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId, isActive: true },
    });
  }
}
