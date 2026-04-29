import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const { items, tenantId, ...orderData } = createOrderDto;
    
    // Buscar todos os produtos para calcular preços
    const productIds = items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
    });
    
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // Verificar estoque e validar produtos
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Produto ${item.productId} não encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Estoque insuficiente para ${product.name}`);
      }
    }
    
    // Calcular subtotal - com verificação de undefined
    let subtotal = 0;
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    }
    
    const total = subtotal + (orderData.deliveryFee || 0);
    
    // Criar pedido
    const order = await this.prisma.order.create({
      data: {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        deliveryType: orderData.deliveryType,
        deliveryFee: orderData.deliveryFee || 0,
        subtotal,
        total,
        status: 'pending',
        paymentMethod: 'pending',
        tenantId,
        items: {
          create: items.map(item => {
            const product = productMap.get(item.productId);
            if (!product) {
              throw new Error(`Produto ${item.productId} não encontrado`);
            }
            return {
              productId: item.productId,
              productName: product.name,
              quantity: item.quantity,
              unitPrice: product.price,
              totalPrice: product.price * item.quantity,
              variationSelected: item.variationSelected,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });
    
    return order;
  }

  async findAllOrders(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(id: string, tenantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    
    return order;
  }

  async updateOrderStatus(id: string, tenantId: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.findOrderById(id, tenantId);
    
    // Se pedido foi pago, baixar estoque
    if (updateDto.status === 'paid' && order.status !== 'paid') {
      for (const item of order.items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        
        // Registrar movimentação de estoque
        await this.prisma.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            reason: 'sale',
            orderId: order.id,
          },
        });
      }
    }
    
    return this.prisma.order.update({
      where: { id },
      data: { status: updateDto.status },
      include: { items: true },
    });
  }

  async getOrdersByStatus(tenantId: string, status: string) {
    return this.prisma.order.findMany({
      where: { tenantId, status },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
