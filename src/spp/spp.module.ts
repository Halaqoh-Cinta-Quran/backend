import { Module } from '@nestjs/common';
import { SppService } from './spp.service';
import { SppController } from './spp.controller';

@Module({
  controllers: [SppController],
  providers: [SppService],
  exports: [SppService],
})
export class SppModule {}
