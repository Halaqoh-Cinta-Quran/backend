import { IsNotEmpty, IsUUID } from 'class-validator';

export class EnrollPelajarDto {
  @IsUUID()
  @IsNotEmpty()
  pelajarId: string;
}
