import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para aceitar requisições do frontend
  app.enableCors();
  
  // Porta que o servidor vai rodar
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}`);
}
bootstrap();