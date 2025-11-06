import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { z } from 'zod';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TrpcAuthRouter {
  constructor(private readonly trpc: TrpcService) {}

  get authRouter() {
    return this.trpc.router({
      // Login
      login: this.trpc.procedure
        .input(
          z.object({
            email: z.string().email(),
            password: z.string(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          const { email, password } = input;

          // Find user
          const user = await ctx.prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error('Invalid credentials');
          }

          // Validate password with Argon2
          const isValid = await argon2.verify(user.password, password);

          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          // Generate JWT token
          const token = jwt.sign(
            {
              sub: user.id,
              email: user.email,
              role: user.role,
            },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '7d' },
          );

          return {
            access_token: token,
            user: {
              id: user.id,
              email: user.email,
              nama: user.nama,
              role: user.role,
            },
          };
        }),

      // Register
      register: this.trpc.procedure
        .input(
          z.object({
            email: z.string().email(),
            password: z.string().min(6),
            nama: z.string(),
            role: z.enum(['ADMIN', 'PENGAJAR', 'PELAJAR']),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          const hashedPassword = await argon2.hash(input.password);

          const user = await ctx.prisma.user.create({
            data: {
              email: input.email,
              password: hashedPassword,
              nama: input.nama,
              role: input.role,
            },
          });

          return {
            id: user.id,
            email: user.email,
            nama: user.nama,
            role: user.role,
          };
        }),

      // Get current user profile
      me: this.trpc.protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.user?.sub },
          select: {
            id: true,
            email: true,
            nama: true,
            role: true,
            createdAt: true,
          },
        });

        return user;
      }),
    });
  }
}
