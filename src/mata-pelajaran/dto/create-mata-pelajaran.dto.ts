import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMataPelajaranDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsOptional()
  kode?: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;
}
