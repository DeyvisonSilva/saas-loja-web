import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.pedidosService.createOrder(createOrderDto);
  }

  @Get(':tenantId')
  findAll(@Param('tenantId') tenantId: string) {
    return this.pedidosService.findAllOrders(tenantId);
  }

  @Get('status/:tenantId')
  findByStatus(
    @Param('tenantId') tenantId: string,
    @Query('status') status: string
  ) {
    return this.pedidosService.getOrdersByStatus(tenantId, status);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.pedidosService.findOrderById(id, tenantId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    return this.pedidosService.updateOrderStatus(id, tenantId, updateOrderStatusDto);
  }
}
