import { Module } from '@nestjs/common';
import { MateriService } from './materi.service';
import { MateriController } from './materi.controller';

@Module({
  controllers: [MateriController],
  providers: [MateriService],
})
export class MateriModule {}
