import { PartialType } from '@nestjs/mapped-types';
import { CreateMataPelajaranDto } from './create-mata-pelajaran.dto';

export class UpdateMataPelajaranDto extends PartialType(
  CreateMataPelajaranDto,
) {}
