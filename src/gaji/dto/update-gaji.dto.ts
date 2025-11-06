import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { StatusPembayaran } from '@prisma/client';

export class UpdateGajiDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  nominal?: number;

  @IsEnum(StatusPembayaran)
  @IsOptional()
  status?: StatusPembayaran;
}
