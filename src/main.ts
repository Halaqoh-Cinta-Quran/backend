import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as trpcExpress from '@trpc/server/adapters/express';
import { TrpcRouter } from './trpc/trpc.router';
import { createContext } from './trpc/trpc.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Setup tRPC
  const trpcRouter = app.get(TrpcRouter);
  const prisma = app.get(PrismaService);

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext: createContext(prisma),
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📡 tRPC endpoint available at: http://localhost:${port}/trpc`);
}
bootstrap();
