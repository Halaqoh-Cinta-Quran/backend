import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { SemesterStatus } from '@prisma/client';

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsDateString()
  @IsNotEmpty()
  tanggalMulai: string;

  @IsDateString()
  @IsNotEmpty()
  tanggalAkhir: string;

  @IsEnum(SemesterStatus)
  @IsOptional()
  status?: SemesterStatus;
}
