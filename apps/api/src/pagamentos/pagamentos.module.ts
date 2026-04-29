import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';
import { AsaasService } from './asaas.service';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from '../pedidos/pedidos.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [PagamentosController],
  providers: [
    PagamentosService,
    AsaasService,
    PrismaService,
    PedidosService,
  ],
  exports: [PagamentosService],
})
export class PagamentosModule {}
