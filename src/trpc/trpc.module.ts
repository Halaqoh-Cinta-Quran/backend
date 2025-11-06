import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { TrpcAuthRouter } from './routers/auth.router';
import { TrpcKelasRouter } from './routers/kelas.router';
import { TrpcNilaiRouter } from './routers/nilai.router';

@Module({
  providers: [
    TrpcService,
    TrpcRouter,
    TrpcAuthRouter,
    TrpcKelasRouter,
    TrpcNilaiRouter,
  ],
  exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {}
