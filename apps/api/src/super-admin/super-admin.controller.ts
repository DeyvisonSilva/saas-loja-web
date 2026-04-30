import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    console.log('📥 POST /super-admin/login', body.email);
    return this.superAdminService.login(body.email, body.password);
  }
  
  @Get('test')
  async test() {
    return { status: 'ok', message: 'Super Admin API funcionando' };
  }
  
  @Get('stats')
  async getStats() {
    return this.superAdminService.getStats();
  }
  
  @Get('lojas')
  async getLojas() {
    return this.superAdminService.getAllLojas();
  }
  
  @Get('pedidos')
  async getPedidos() {
    return this.superAdminService.getAllPedidos();
  }
}
