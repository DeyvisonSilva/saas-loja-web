import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { TenantsModule } from './tenants/tenants.module';
import { CardapioModule } from './cardapio/cardapio.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { AuthModule } from './auth/auth.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    TenantsModule,
    CardapioModule,
    PedidosModule,
    PagamentosModule,
    AuthModule,
    SuperAdminModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
