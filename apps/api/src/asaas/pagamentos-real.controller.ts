import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { AsaasRealService } from './asaas-real.service';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from '../pedidos/pedidos.service';

@Controller('pagamentos-real')
export class PagamentosRealController {
  constructor(
    private asaas: AsaasRealService,
    private prisma: PrismaService,
    private pedidos: PedidosService,
  ) {}

  @Post('pix/:orderId')
  async createPixPayment(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
    @Body() body: { customerCpfCnpj?: string; customerEmail?: string }
  ) {
    const order = await this.pedidos.findOrderById(orderId, tenantId);
    
    if (order.status !== 'pending') {
      throw new Error('Pedido já foi pago ou cancelado');
    }

    // Criar cliente no Asaas
    const customer = await this.asaas.createCustomer({
      name: order.customerName,
      phone: order.customerPhone,
      email: body.customerEmail,
      cpfCnpj: body.customerCpfCnpj,
    });

    // Criar pagamento PIX
    const payment = await this.asaas.createPayment({
      customerId: customer.id,
      value: order.total,
      externalReference: order.id,
      billingType: 'PIX',
    });

    // Atualizar pedido
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        asaasPaymentId: payment.id,
        paymentMethod: 'pix',
      },
    });

    return payment;
  }

  @Post('boleto/:orderId')
  async createBoletoPayment(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
  ) {
    const order = await this.pedidos.findOrderById(orderId, tenantId);
    
    const customer = await this.asaas.createCustomer({
      name: order.customerName,
      phone: order.customerPhone,
    });

    const payment = await this.asaas.createPayment({
      customerId: customer.id,
      value: order.total,
      externalReference: order.id,
      billingType: 'BOLETO',
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        asaasPaymentId: payment.id,
        paymentMethod: 'boleto',
      },
    });

    return payment;
  }

  @Post('webhook')
  async webhook(@Body() payload: any) {
    const { event, payment } = payload;
    
    if (event === 'PAYMENT_RECEIVED') {
      const order = await this.prisma.order.findFirst({
        where: { asaasPaymentId: payment.id },
      });
      
      if (order && order.status === 'pending') {
        await this.pedidos.updateOrderStatus(order.id, order.tenantId, {
          status: 'paid',
        });
      }
    }
    
    return { received: true };
  }

  @Get('status/:paymentId')
  async getStatus(@Param('paymentId') paymentId: string) {
    return this.asaas.getPaymentStatus(paymentId);
  }
}
