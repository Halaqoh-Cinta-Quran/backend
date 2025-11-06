import { IsNotEmpty, IsString, Length } from 'class-validator';

export class HadirDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  kodePresensi: string;
}
