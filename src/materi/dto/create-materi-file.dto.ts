import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMateriFileDto {
  @IsNotEmpty()
  @IsUUID()
  materiSectionId: string;
}
