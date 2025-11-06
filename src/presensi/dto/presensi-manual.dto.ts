import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { StatusPresensi } from '@prisma/client';

export class PresensiManualDto {
  @IsUUID()
  @IsNotEmpty()
  pelajarId: string;

  @IsEnum(StatusPresensi)
  @IsNotEmpty()
  status: StatusPresensi;
}
