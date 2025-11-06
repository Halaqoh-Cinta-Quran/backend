import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateKelasDto {
  @IsString()
  @IsNotEmpty()
  namaKelas: string;

  @IsString()
  @IsOptional()
  jadwalHari?: string;

  @IsString()
  @IsOptional()
  jadwalJam?: string;

  @IsUUID()
  @IsNotEmpty()
  semesterId: string;

  @IsUUID()
  @IsNotEmpty()
  mataPelajaranId: string;
}
