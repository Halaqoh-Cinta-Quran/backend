import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateKomponenNilaiDto {
  @IsUUID()
  @IsNotEmpty()
  kelasId: string;

  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  bobot?: number;
}
