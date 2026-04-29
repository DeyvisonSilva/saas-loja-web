import { IsString, IsEmail, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  subdomain: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  cnpj?: string;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}