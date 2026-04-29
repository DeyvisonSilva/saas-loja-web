import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('pix/:orderId')
  createPixPayment(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.pagamentosService.createPixPayment(orderId, tenantId);
  }

  @Post('webhook/asaas')
  webhook(@Body() payload: any) {
    return this.pagamentosService.handleWebhook(payload);
  }

  @Get('status/:paymentId')
  getStatus(@Param('paymentId') paymentId: string) {
    return this.pagamentosService.checkPaymentStatus(paymentId);
  }

  @Get('qr-code/:orderId')
  getQrCode(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.pagamentosService.getPaymentQrCode(orderId, tenantId);
  }
}
