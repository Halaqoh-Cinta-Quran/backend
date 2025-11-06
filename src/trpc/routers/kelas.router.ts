import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { z } from 'zod';

@Injectable()
export class TrpcKelasRouter {
  constructor(private readonly trpc: TrpcService) {}

  get kelasRouter() {
    return this.trpc.router({
      // Get all kelas
      getAll: this.trpc.protectedProcedure.query(async ({ ctx }) => {
        return ctx.prisma.kelas.findMany({
          include: {
            semester: true,
            mataPelajaran: true,
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }),

      // Get kelas by ID
      getById: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
          const kelas = await ctx.prisma.kelas.findUnique({
            where: { id: input.id },
            include: {
              semester: true,
              mataPelajaran: true,
              enrollments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      nama: true,
                      email: true,
                      role: true,
                    },
                  },
                },
              },
            },
          });

          if (!kelas) {
            throw new Error('Kelas tidak ditemukan');
          }

          return kelas;
        }),

      // Create kelas (Admin only)
      create: this.trpc.adminProcedure
        .input(
          z.object({
            namaKelas: z.string(),
            jadwalHari: z.string().optional(),
            jadwalJam: z.string().optional(),
            semesterId: z.string().uuid(),
            mataPelajaranId: z.string().uuid(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          return ctx.prisma.kelas.create({
            data: input,
            include: {
              semester: true,
              mataPelajaran: true,
            },
          });
        }),

      // Update kelas (Admin only)
      update: this.trpc.adminProcedure
        .input(
          z.object({
            id: z.string().uuid(),
            namaKelas: z.string().optional(),
            jadwalHari: z.string().optional(),
            jadwalJam: z.string().optional(),
            semesterId: z.string().uuid().optional(),
            mataPelajaranId: z.string().uuid().optional(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          const { id, ...data } = input;

          return ctx.prisma.kelas.update({
            where: { id },
            data,
            include: {
              semester: true,
              mataPelajaran: true,
            },
          });
        }),

      // Delete kelas (Admin only)
      delete: this.trpc.adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
          return ctx.prisma.kelas.delete({
            where: { id: input.id },
          });
        }),

      // Enroll pelajar (Admin only)
      enrollPelajar: this.trpc.adminProcedure
        .input(
          z.object({
            kelasId: z.string().uuid(),
            userId: z.string().uuid(),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          // Validate user is PELAJAR
          const user = await ctx.prisma.user.findUnique({
            where: { id: input.userId },
          });

          if (!user || user.role !== 'PELAJAR') {
            throw new Error('User bukan pelajar');
          }

          return ctx.prisma.enrollment.create({
            data: {
              userId: input.userId,
              kelasId: input.kelasId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  nama: true,
                  email: true,
                },
              },
              kelas: {
                select: {
                  id: true,
                  namaKelas: true,
                },
              },
            },
          });
        }),

      // Get my kelas (for PELAJAR and PENGAJAR)
      getMyKelas: this.trpc.protectedProcedure.query(async ({ ctx }) => {
        const enrollments = await ctx.prisma.enrollment.findMany({
          where: { userId: ctx.user?.sub },
          include: {
            kelas: {
              include: {
                semester: true,
                mataPelajaran: true,
              },
            },
          },
        });

        return enrollments.map((e) => e.kelas);
      }),
    });
  }
}
