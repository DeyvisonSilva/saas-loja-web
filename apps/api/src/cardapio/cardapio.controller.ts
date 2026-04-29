import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CardapioService } from './cardapio.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateProductDto, UpdateProductDto } from './dto/cardapio.dto';

@Controller('cardapio')
export class CardapioController {
  constructor(private readonly cardapioService: CardapioService) {}

  // ==================== CATEGORIAS ====================
  
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.cardapioService.createCategory(createCategoryDto);
  }

  @Get('categories/:tenantId')
  findAllCategories(@Param('tenantId') tenantId: string) {
    return this.cardapioService.findAllCategories(tenantId);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.cardapioService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.cardapioService.deleteCategory(id);
  }

  // ==================== PRODUTOS ====================
  
  @Post('products')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.cardapioService.createProduct(createProductDto);
  }

  @Get('products/:tenantId')
  findAllProducts(
    @Param('tenantId') tenantId: string,
    @Query('all') all?: string
  ) {
    return this.cardapioService.findAllProducts(tenantId, all === 'true');
  }

  @Get('products/detail/:id')
  findProductById(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.cardapioService.findProductById(id, tenantId);
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Query('tenantId') tenantId: string
  ) {
    return this.cardapioService.updateProduct(id, updateProductDto, tenantId);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.cardapioService.deleteProduct(id, tenantId);
  }

  @Patch('products/:id/stock')
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Query('tenantId') tenantId: string
  ) {
    return this.cardapioService.updateStock(id, quantity, tenantId);
  }

  // ==================== VARIAÇÕES ====================
  
  @Post('products/:productId/variations')
  addVariation(
    @Param('productId') productId: string,
    @Body('name') name: string,
    @Body('options') options: string[],
    @Query('tenantId') tenantId: string
  ) {
    return this.cardapioService.addVariation(productId, name, options, tenantId);
  }

  @Get('products/:productId/variations')
  getVariations(@Param('productId') productId: string, @Query('tenantId') tenantId: string) {
    return this.cardapioService.getVariations(productId, tenantId);
  }
}
