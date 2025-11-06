import { Module } from '@nestjs/common';
import { MataPelajaranService } from './mata-pelajaran.service';
import { MataPelajaranController } from './mata-pelajaran.controller';

@Module({
  controllers: [MataPelajaranController],
  providers: [MataPelajaranService],
  exports: [MataPelajaranService],
})
export class MataPelajaranModule {}
