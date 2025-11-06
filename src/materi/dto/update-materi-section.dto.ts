import { PartialType } from '@nestjs/mapped-types';
import { CreateMateriSectionDto } from './create-materi-section.dto';

export class UpdateMateriSectionDto extends PartialType(
  CreateMateriSectionDto,
) {}
