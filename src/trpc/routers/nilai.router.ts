import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { z } from 'zod';

@Injectable()
export class TrpcNilaiRouter {
  constructor(private readonly trpc: TrpcService) {}

  get nilaiRouter() {
    return this.trpc.router({
      // Create Komponen Nilai (Pengajar)
      createKomponen: this.trpc.pengajarProcedure
        .input(
          z.object({
            kelasId: z.string().uuid(),
            nama: z.string(),
            bobot: z.number().min(0).max(100),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          // Validate pengajar is assigned to kelas
          const kelas = await ctx.prisma.kelas.findUnique({
            where: { id: input.kelasId },
            include: {
              enrollments: {
                where: {
                  userId: ctx.user!.sub,
                  user: { role: 'PENGAJAR' },
                },
              },
            },
          });

          if (!kelas || kelas.enrollments.length === 0) {
            throw new Error('Anda tidak di-assign ke kelas ini');
          }

          return ctx.prisma.komponenNilai.create({
            data: {
              kelasId: input.kelasId,
              nama: input.nama,
              bobot: input.bobot,
              createdBy: ctx.user?.sub || '',
            },
            include: {
              kelas: {
                select: {
                  namaKelas: true,
                  mataPelajaran: { select: { nama: true } },
                },
              },
            },
          });
        }),

      // Entry nilai (Pengajar)
      entryNilai: this.trpc.pengajarProcedure
        .input(
          z.object({
            komponenId: z.string().uuid(),
            pelajarId: z.string().uuid(),
            nilai: z.number().min(0).max(100),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          // Validate komponen exists and pengajar has access
          const komponen = await ctx.prisma.komponenNilai.findUnique({
            where: { id: input.komponenId },
            include: {
              kelas: {
                include: {
                  enrollments: {
                    where: {
                      userId: ctx.user!.sub,
                      user: { role: 'PENGAJAR' },
                    },
                  },
                },
              },
            },
          });

          if (!komponen || komponen.kelas.enrollments.length === 0) {
            throw new Error('Anda tidak memiliki akses');
          }

          // Upsert nilai
          const existing = await ctx.prisma.nilai.findUnique({
            where: {
              komponenId_userId: {
                komponenId: input.komponenId,
                userId: input.pelajarId,
              },
            },
          });

          if (existing) {
            return ctx.prisma.nilai.update({
              where: { id: existing.id },
              data: { nilai: input.nilai },
              include: {
                komponen: {
                  include: {
                    kelas: {
                      select: {
                        namaKelas: true,
                        mataPelajaran: { select: { nama: true } },
                      },
                    },
                  },
                },
                user: { select: { nama: true, email: true } },
              },
            });
          }

          return ctx.prisma.nilai.create({
            data: {
              komponenId: input.komponenId,
              userId: input.pelajarId,
              nilai: input.nilai,
            },
            include: {
              komponen: {
                include: {
                  kelas: {
                    select: {
                      namaKelas: true,
                      mataPelajaran: { select: { nama: true } },
                    },
                  },
                },
              },
              user: { select: { nama: true, email: true } },
            },
          });
        }),

      // Get my nilai (Pelajar)
      getMyNilai: this.trpc.protectedProcedure.query(async ({ ctx }) => {
        const enrollments = await ctx.prisma.enrollment.findMany({
          where: { userId: ctx.user?.sub },
          include: {
            kelas: {
              include: {
                semester: { select: { nama: true } },
                mataPelajaran: { select: { nama: true } },
                komponenNilai: {
                  include: {
                    nilai: {
                      where: { userId: ctx.user?.sub },
                    },
                  },
                },
              },
            },
          },
        });

        return enrollments.map((enrollment) => ({
          kelas: {
            id: enrollment.kelas.id,
            namaKelas: enrollment.kelas.namaKelas,
            semester: enrollment.kelas.semester,
            mataPelajaran: enrollment.kelas.mataPelajaran,
          },
          nilaiList: enrollment.kelas.komponenNilai.map((komponen) => ({
            komponen: {
              id: komponen.id,
              nama: komponen.nama,
              bobot: komponen.bobot,
            },
            nilai: komponen.nilai[0]?.nilai || null,
          })),
        }));
      }),

      // Get nilai by kelas (Pengajar)
      getNilaiByKelas: this.trpc.pengajarProcedure
        .input(z.object({ kelasId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
          const komponenList = await ctx.prisma.komponenNilai.findMany({
            where: { kelasId: input.kelasId },
            include: {
              nilai: {
                include: {
                  user: {
                    select: {
                      id: true,
                      nama: true,
                      email: true,
                    },
                  },
                },
              },
            },
          });

          return komponenList;
        }),
    });
  }
}
