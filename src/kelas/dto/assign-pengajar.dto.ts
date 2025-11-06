import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPengajarDto {
  @IsUUID()
  @IsNotEmpty()
  pengajarId: string;
}
