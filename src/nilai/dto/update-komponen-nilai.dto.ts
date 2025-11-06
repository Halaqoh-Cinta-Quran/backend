import { PartialType } from '@nestjs/mapped-types';
import { CreateKomponenNilaiDto } from './create-komponen-nilai.dto';

export class UpdateKomponenNilaiDto extends PartialType(
  CreateKomponenNilaiDto,
) {}
