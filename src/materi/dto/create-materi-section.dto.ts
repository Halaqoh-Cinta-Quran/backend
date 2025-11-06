import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMateriSectionDto {
  @IsNotEmpty()
  @IsUUID()
  kelasId: string;

  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsString()
  deskripsi?: string;
}
