import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  variationSelected?: string;
}

export class CreateOrderDto {
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsString()
  deliveryType: string; // 'delivery' ou 'pickup'

  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  tenantId: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string; // pending, paid, preparing, ready, delivered, cancelled
}
