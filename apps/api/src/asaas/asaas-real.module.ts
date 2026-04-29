import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PagamentosRealController } from './pagamentos-real.controller';
import { AsaasRealService } from './asaas-real.service';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from '../pedidos/pedidos.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [PagamentosRealController],
  providers: [AsaasRealService, PrismaService, PedidosService],
  exports: [AsaasRealService],
})
export class AsaasRealModule {}
