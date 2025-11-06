import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncementDto } from './create-announcement.dto';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { AnnouncementScope } from '@prisma/client';

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  judul?: string;

  @IsString()
  @IsOptional()
  isi?: string;

  @IsEnum(AnnouncementScope)
  @IsOptional()
  scope?: AnnouncementScope;

  @ValidateIf((o) => o.scope === 'KELAS')
  @IsUUID()
  @IsOptional()
  kelasId?: string;
}
