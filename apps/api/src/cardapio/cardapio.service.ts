import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateProductDto, UpdateProductDto } from './dto/cardapio.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CardapioService {
  constructor(private prisma: PrismaService) {}

  // ==================== CATEGORIAS ====================
  
  async createCategory(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        order: data.order || 0,
        tenantId: data.tenantId,
      },
    });
  }

  async findAllCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
      include: {
        products: {
          where: { isAvailable: true },
        },
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  // ==================== PRODUTOS ====================

  async createProduct(data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        stock: data.stock || 0,
        minStock: data.minStock || 5,
        isAvailable: data.isAvailable ?? true,
        availableFrom: data.availableFrom,
        availableTo: data.availableTo,
        tenantId: data.tenantId,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAllProducts(tenantId: string, includeUnavailable: boolean = false) {
    const where: Prisma.ProductWhereInput = { tenantId };
    
    if (!includeUnavailable) {
      where.isAvailable = true;
    }
    
    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        variations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProductById(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        variations: true,
      },
    });
    
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    
    return product;
  }

  async updateProduct(id: string, data: UpdateProductDto, tenantId: string) {
    // Verificar se o produto existe
    await this.findProductById(id, tenantId);
    
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        variations: true,
      },
    });
  }

  async deleteProduct(id: string, tenantId: string) {
    await this.findProductById(id, tenantId);
    return this.prisma.product.delete({ where: { id } });
  }

  async updateStock(id: string, quantity: number, tenantId: string) {
    const product = await this.findProductById(id, tenantId);
    
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error('Estoque insuficiente');
    }
    
    return this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  // ==================== VARIAÇÕES ====================
  
  async addVariation(productId: string, name: string, options: string[], tenantId: string) {
    // Verificar se o produto pertence ao tenant
    await this.findProductById(productId, tenantId);
    
    return this.prisma.variation.create({
      data: {
        name,
        options: JSON.stringify(options),
        productId,
      },
    });
  }

  async getVariations(productId: string, tenantId: string) {
    await this.findProductById(productId, tenantId);
    
    return this.prisma.variation.findMany({
      where: { productId },
    });
  }
}
