import { Module } from '@nestjs/common';
import { CardapioController } from './cardapio.controller';
import { CardapioService } from './cardapio.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CardapioController],
  providers: [CardapioService, PrismaService],
  exports: [CardapioService],
})
export class CardapioModule {}
