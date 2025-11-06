import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import * as trpcExpress from '@trpc/server/adapters/express';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

// Context interface
export interface Context {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
  prisma: PrismaService;
  req: trpcExpress.CreateExpressContextOptions['req'];
  res: trpcExpress.CreateExpressContextOptions['res'];
}

@Injectable()
export class TrpcService {
  constructor(private prisma: PrismaService) {}

  trpc = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
      return shape;
    },
  });

  procedure = this.trpc.procedure;
  router = this.trpc.router;
  mergeRouters = this.trpc.mergeRouters;

  // Middleware untuk autentikasi
  isAuthed = this.trpc.middleware(async ({ ctx, next }): Promise<any> => {
    const token = ctx.req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Tidak ada token',
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret-key',
      ) as { sub: string; email: string; role: string };

      return next({
        ctx: {
          ...ctx,
          user: {
            sub: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          },
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Token tidak valid',
      });
    }
  });

  // Middleware untuk role checking
  hasRole = (roles: string[]): any =>
    this.trpc.middleware(async ({ ctx, next }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Belum login',
        });
      }

      if (!roles.includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Tidak memiliki akses',
        });
      }

      return next({ ctx });
    });

  // Protected procedures
  protectedProcedure = this.procedure.use(this.isAuthed);
  adminProcedure = this.procedure
    .use(this.isAuthed)
    .use(this.hasRole(['ADMIN']));
  pengajarProcedure = this.procedure
    .use(this.isAuthed)
    .use(this.hasRole(['PENGAJAR', 'ADMIN']));
}

// Helper to create context
export const createContext = (
  prisma: PrismaService,
): ((opts: trpcExpress.CreateExpressContextOptions) => Context) => {
  return ({ req, res }: trpcExpress.CreateExpressContextOptions): Context => {
    return {
      req,
      res,
      prisma,
    };
  };
};
