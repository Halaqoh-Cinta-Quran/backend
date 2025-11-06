import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { StatusPembayaran } from '@prisma/client';

export class CreateGajiDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  nominal: number;

  @IsString()
  @IsNotEmpty()
  bulan: string;

  @IsInt()
  @Min(2000)
  @IsNotEmpty()
  tahun: number;

  @IsEnum(StatusPembayaran)
  @IsOptional()
  status?: StatusPembayaran;
}
