import { Module } from '@nestjs/common';
import { GajiService } from './gaji.service';
import { GajiController } from './gaji.controller';

@Module({
  controllers: [GajiController],
  providers: [GajiService],
  exports: [GajiService],
})
export class GajiModule {}
