import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from '../pedidos/pedidos.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PagamentosService {
  constructor(
    private prisma: PrismaService,
    private pedidosService: PedidosService,
  ) {}

  async createPixPayment(orderId: string, tenantId: string) {
    const order = await this.pedidosService.findOrderById(orderId, tenantId);

    if (order.status !== 'pending') {
      throw new BadRequestException('Pedido já foi pago ou cancelado');
    }

    // Gerar payload PIX simulado
    const valor = Math.round(order.total * 100);
    const simulatedPayload = this.generatePixPayload(order, valor);
    const qrCodeImage = await QRCode.toDataURL(simulatedPayload);
    
    const paymentId = `pix_${Date.now()}_${orderId.substring(0,8)}`;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        asaasPaymentId: paymentId,
        paymentMethod: 'pix',
      },
    });

    return {
      success: true,
      paymentId: paymentId,
      qrCode: simulatedPayload,
      qrCodeImage: qrCodeImage,
      status: 'PENDING',
      value: order.total,
      expiresIn: 3600, // 1 hora
    };
  }

  async createCreditCardPayment(orderId: string, tenantId: string, cardData: any) {
    const order = await this.pedidosService.findOrderById(orderId, tenantId);

    if (order.status !== 'pending') {
      throw new BadRequestException('Pedido já foi pago ou cancelado');
    }

    // Simular processamento de cartão
    const paymentId = `card_${Date.now()}_${orderId.substring(0,8)}`;
    const isApproved = Math.random() > 0.1; // 90% de aprovação

    if (isApproved) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          asaasPaymentId: paymentId,
          paymentMethod: 'credit_card',
          status: 'paid',
        },
      });

      // Baixar estoque
      await this.updateStock(order);

      return {
        success: true,
        paymentId: paymentId,
        status: 'PAID',
        value: order.total,
        message: 'Pagamento aprovado!',
      };
    } else {
      return {
        success: false,
        status: 'REFUSED',
        message: 'Pagamento recusado. Tente outro cartão.',
      };
    }
  }

  async createBoletoPayment(orderId: string, tenantId: string) {
    const order = await this.pedidosService.findOrderById(orderId, tenantId);

    if (order.status !== 'pending') {
      throw new BadRequestException('Pedido já foi pago ou cancelado');
    }

    const paymentId = `boleto_${Date.now()}_${orderId.substring(0,8)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Vence em 3 dias

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        asaasPaymentId: paymentId,
        paymentMethod: 'boleto',
      },
    });

    return {
      success: true,
      paymentId: paymentId,
      status: 'PENDING',
      value: order.total,
      boletoUrl: `https://boleto.simulado.com/${paymentId}`,
      boletoPdf: `https://boleto.simulado.com/${paymentId}/pdf`,
      dueDate: dueDate.toISOString(),
      message: 'Boleto gerado com sucesso!',
    };
  }

  async getPaymentStatus(paymentId: string) {
    const order = await this.prisma.order.findFirst({
      where: { asaasPaymentId: paymentId },
    });

    if (!order) {
      throw new BadRequestException('Pagamento não encontrado');
    }

    return {
      paymentId: paymentId,
      status: order.status === 'paid' ? 'PAID' : 'PENDING',
      value: order.total,
      paymentMethod: order.paymentMethod,
    };
  }

  private generatePixPayload(order: any, valor: number): string {
    const nome = order.customerName.substring(0, 25);
    const cidade = "SAO PAULO";
    
    return `00020126360014br.gov.bcb.pix0111simulado.com5204000053039865404${valor}5802BR5913${nome}6009${cidade}62070503***6304FAKE`;
  }

  private async updateStock(order: any) {
    for (const item of order.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

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
}
