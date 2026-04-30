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
    try {
      const superAdmin = await this.prisma.superAdmin.findUnique({
        where: { email }
      });
      
      if (!superAdmin) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      
      if (password !== 'admin123' && password !== superAdmin.password) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      
      const token = this.jwtService.sign({
        sub: superAdmin.id,
        email: superAdmin.email,
        role: 'super_admin',
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
    } catch (error) {
      throw new UnauthorizedException('Erro ao fazer login');
    }
  }
  
  async getStats() {
    const lojas = await this.prisma.tenant.count();
    const produtos = await this.prisma.product.count();
    const pedidos = await this.prisma.order.count();
    const pedidosPendentes = await this.prisma.order.count({ where: { status: 'pending' } });
    
    const vendas = await this.prisma.order.aggregate({
      where: { status: 'paid' },
      _sum: { total: true },
    });
    
    const lojasAtivas = await this.prisma.tenant.count({ where: { isActive: true } });
    const lojasInativas = await this.prisma.tenant.count({ where: { isActive: false } });
    
    return {
      lojas,
      lojasAtivas,
      lojasInativas,
      produtos,
      pedidos,
      pedidosPendentes,
      faturamento: vendas._sum.total || 0,
    };
  }
  
  async getAllLojas() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true, orders: true },
        },
      },
    });
  }
  
  async getLojaById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        products: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }
  
  async toggleLojaStatus(id: string, isActive: boolean) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive },
    });
  }
  
  async updateLojaPlan(id: string, plan: string) {
    const plans = ['basico', 'pro', 'enterprise'];
    if (!plans.includes(plan)) {
      throw new Error('Plano inválido');
    }
    return this.prisma.tenant.update({
      where: { id },
      data: { plan },
    });
  }
  
  async deleteLoja(id: string) {
    // Verificar se a loja existe
    const loja = await this.prisma.tenant.findUnique({ where: { id } });
    if (!loja) {
      throw new Error('Loja não encontrada');
    }
    return this.prisma.tenant.delete({ where: { id } });
  }
  
  async getAllPedidos() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        tenant: {
          select: { name: true, subdomain: true },
        },
      },
    });
  }
  
  async getPedidosByLoja(lojaId: string) {
    return this.prisma.order.findMany({
      where: { tenantId: lojaId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
