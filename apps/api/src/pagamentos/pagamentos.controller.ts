import { Controller, Post, Param, Query } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('pix/:orderId')
  async createPixPayment(
    @Param('orderId') orderId: string,
    @Query('tenantId') tenantId: string,
  ) {
    console.log(`Controller: Gerando PIX para pedido ${orderId}, tenant ${tenantId}`);
    const result = await this.pagamentosService.createPixPayment(orderId, tenantId);
    return result;
  }
}
