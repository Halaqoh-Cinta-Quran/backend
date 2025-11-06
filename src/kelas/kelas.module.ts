import { Module } from '@nestjs/common';
import { KelasService } from './kelas.service';
import { KelasController } from './kelas.controller';

@Module({
  controllers: [KelasController],
  providers: [KelasService],
  exports: [KelasService],
})
export class KelasModule {}
