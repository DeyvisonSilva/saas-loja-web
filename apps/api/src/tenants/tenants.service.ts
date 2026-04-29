import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    console.log('Criando tenant com dados:', data);
    
    // Verificar se senha foi fornecida
    if (!data.password) {
      throw new BadRequestException('Senha é obrigatória');
    }
    
    // Fazer hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    return this.prisma.tenant.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        email: data.email,
        password: passwordHash, // Agora é sempre string, não null
        phone: data.phone,
        cnpj: data.cnpj || null,
        plan: data.plan || 'basic',
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        products: true,
        orders: true,
      },
    });
  }

  async findBySubdomain(subdomain: string) {
    return this.prisma.tenant.findUnique({
      where: { subdomain },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.tenant.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = { ...data };
    
    // Se tiver senha, fazer hash
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password; // Não atualizar senha se não veio
    }
    
    return this.prisma.tenant.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }
}
