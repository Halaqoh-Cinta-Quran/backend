import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcAuthRouter } from './routers/auth.router';
import { TrpcKelasRouter } from './routers/kelas.router';
import { TrpcNilaiRouter } from './routers/nilai.router';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly authRouter: TrpcAuthRouter,
    private readonly kelasRouter: TrpcKelasRouter,
    private readonly nilaiRouter: TrpcNilaiRouter,
  ) {}

  get appRouter() {
    return this.trpc.router({
      auth: this.authRouter.authRouter,
      kelas: this.kelasRouter.kelasRouter,
      nilai: this.nilaiRouter.nilaiRouter,
    });
  }

  get router() {
    return this.appRouter;
  }
}

export type AppRouter = TrpcRouter['appRouter'];
