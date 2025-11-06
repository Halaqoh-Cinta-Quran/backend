import { IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class EntryNilaiDto {
  @IsUUID()
  @IsNotEmpty()
  komponenId: string;

  @IsUUID()
  @IsNotEmpty()
  pelajarId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  nilai: number;
}
