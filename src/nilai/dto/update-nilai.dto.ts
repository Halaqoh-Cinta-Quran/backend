import { IsNumber, Min, Max } from 'class-validator';

export class UpdateNilaiDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  nilai: number;
}
