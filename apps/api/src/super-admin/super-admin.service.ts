import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    console.log('🔐 Tentativa de login:', email);
    
    // Buscar no banco de dados
    let superAdmin = null;
    try {
      superAdmin = await this.prisma.superAdmin.findUnique({
        where: { email }
      });
    } catch (error) {
      console.log('Erro ao buscar no banco:', error.message);
    }
    
    // Se não encontrou, usar credencial padrão
    if (!superAdmin) {
      console.log('Usando credencial padrão');
      if (email === 'admin@sistema.com' && password === 'admin123') {
        const token = this.jwtService.sign({
          sub: '1',
          email: 'admin@sistema.com',
          role: 'super_admin',
        });
        return {
          token,
          admin: {
            id: '1',
            name: 'Administrador Master',
            email: 'admin@sistema.com',
            role: 'super_admin',
          },
        };
      }
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    // Verificar senha
    if (superAdmin.password !== password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    const token = this.jwtService.sign({
      sub: superAdmin.id,
      email: superAdmin.email,
      role: superAdmin.role,
    });
    
    return {
      token,
      admin: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    };
  }
  
  async getStats() {
    try {
      const lojas = await this.prisma.tenant.count();
      const produtos = await this.prisma.product.count();
      const pedidos = await this.prisma.order.count();
      const vendas = await this.prisma.order.aggregate({
        where: { status: 'paid' },
        _sum: { total: true },
      });
      return { lojas, produtos, pedidos, faturamento: vendas._sum.total || 0 };
    } catch (error) {
      return { lojas: 0, produtos: 0, pedidos: 0, faturamento: 0 };
    }
  }
  
  async getAllLojas() {
    try {
      return await this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      return [];
    }
  }
  
  async getAllPedidos() {
    try {
      return await this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { tenant: { select: { name: true } } },
      });
    } catch (error) {
      return [];
    }
  }
}
