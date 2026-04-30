import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('pix/:orderId')
  async createPixPayment(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.pagamentosService.createPixPayment(orderId, tenantId);
  }

  @Post('cartao/:orderId')
  async createCreditCardPayment(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
    @Body() cardData: any,
  ) {
    return this.pagamentosService.createCreditCardPayment(orderId, tenantId, cardData);
  }

  @Post('boleto/:orderId')
  async createBoletoPayment(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.pagamentosService.createBoletoPayment(orderId, tenantId);
  }

  @Get('status/:paymentId')
  async getStatus(@Param('paymentId') paymentId: string) {
    return this.pagamentosService.getPaymentStatus(paymentId);
  }
}
