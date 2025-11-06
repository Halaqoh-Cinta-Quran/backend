import { Module } from '@nestjs/common';
import { NilaiService } from './nilai.service';
import { NilaiController } from './nilai.controller';

@Module({
  controllers: [NilaiController],
  providers: [NilaiService],
  exports: [NilaiService],
})
export class NilaiModule {}
