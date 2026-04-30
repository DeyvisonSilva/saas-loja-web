import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.superAdminService.login(body.email, body.password);
  }
  
  @Get('stats')
  async getStats() {
    return this.superAdminService.getStats();
  }
  
  @Get('lojas')
  async getAllLojas() {
    return this.superAdminService.getAllLojas();
  }
  
  @Get('lojas/:id')
  async getLojaById(@Param('id') id: string) {
    return this.superAdminService.getLojaById(id);
  }
  
  @Patch('lojas/:id/status')
  async toggleLojaStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.superAdminService.toggleLojaStatus(id, isActive);
  }
  
  @Patch('lojas/:id/plan')
  async updateLojaPlan(@Param('id') id: string, @Body('plan') plan: string) {
    return this.superAdminService.updateLojaPlan(id, plan);
  }
  
  @Delete('lojas/:id')
  async deleteLoja(@Param('id') id: string) {
    return this.superAdminService.deleteLoja(id);
  }
  
  @Get('pedidos')
  async getAllPedidos() {
    return this.superAdminService.getAllPedidos();
  }
  
  @Get('pedidos/:lojaId')
  async getPedidosByLoja(@Param('lojaId') lojaId: string) {
    return this.superAdminService.getPedidosByLoja(lojaId);
  }
}
