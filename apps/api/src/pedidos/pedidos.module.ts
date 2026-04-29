import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, PrismaService],
  exports: [PedidosService],
})
export class PedidosModule {}
