import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsaasService } from './asaas.service';
import { PedidosService } from '../pedidos/pedidos.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PagamentosService {
  constructor(
    private prisma: PrismaService,
    private asaasService: AsaasService,
    private pedidosService: PedidosService,
  ) {}

  async createPixPayment(orderId: string, tenantId: string) {
    console.log(`Criando PIX para pedido ${orderId} - tenant ${tenantId}`);
    
    // Buscar pedido
    const order = await this.pedidosService.findOrderById(orderId, tenantId);
    console.log(`Pedido encontrado: ${order.id}, status: ${order.status}, total: ${order.total}`);

    if (order.status !== 'pending') {
      throw new BadRequestException('Pedido já foi pago ou cancelado');
    }

    // GERAR PIX SIMULADO PARA TESTE
    const valor = Math.round(order.total * 100);
    const simulatedPayload = `00020126360014br.gov.bcb.pix0111simulado.com5204000053039865404${valor}5802BR5913${order.customerName.substring(0, 20)}6009SAO PAULO62070503***6304FAKE`;
    const qrCodeImage = await QRCode.toDataURL(simulatedPayload);
    
    const paymentId = `sim_pay_${Date.now()}`;

    // Atualizar pedido com ID do pagamento
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        asaasPaymentId: paymentId,
        paymentMethod: 'pix',
      },
    });

    console.log(`PIX gerado com sucesso: ${paymentId}`);

    return {
      id: paymentId,
      qrCode: simulatedPayload,
      qrCodeImage: qrCodeImage,
      status: 'PENDING',
      value: order.total,
    };
  }

  async handleWebhook(payload: any) {
    console.log('Webhook recebido:', payload);
    return { message: 'Webhook recebido' };
  }

  async checkPaymentStatus(paymentId: string) {
    return { id: paymentId, status: 'PENDING' };
  }

  async getPaymentQrCode(orderId: string, tenantId: string) {
    const order = await this.pedidosService.findOrderById(orderId, tenantId);
    
    if (!order.asaasPaymentId) {
      throw new BadRequestException('Pagamento não encontrado');
    }

    // Gerar QR Code simulado
    const simulatedPayload = `00020126360014br.gov.bcb.pix0111simulado.com5204000053039865404${Math.round(order.total * 100)}5802BR5913Cliente6009SAO PAULO62070503***6304FAKE`;
    const qrCodeImage = await QRCode.toDataURL(simulatedPayload);

    return {
      qrCode: simulatedPayload,
      qrCodeImage: qrCodeImage,
    };
  }
}
