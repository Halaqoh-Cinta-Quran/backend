import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { AnnouncementScope } from '@prisma/client';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsString()
  @IsNotEmpty()
  isi: string;

  @IsEnum(AnnouncementScope)
  @IsNotEmpty()
  scope: AnnouncementScope;

  @ValidateIf((o: CreateAnnouncementDto) => o.scope === 'KELAS')
  @IsUUID()
  @IsNotEmpty()
  kelasId?: string;
}
