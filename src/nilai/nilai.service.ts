import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  CreateKomponenNilaiDto,
  UpdateKomponenNilaiDto,
  EntryNilaiDto,
  UpdateNilaiDto,
} from './dto';

export interface GroupedNilai {
  kelas: {
    id: string;
    namaKelas: string;
    semester: {
      id: string;
      nama: string;
    };
    mataPelajaran: {
      id: string;
      nama: string;
    };
  };
  nilaiList: Array<{
    id: string;
    nilai: number;
    komponen: {
      id: string;
      nama: string;
      bobot: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }>;
}

@Injectable()
export class NilaiService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== KOMPONEN NILAI ====================

  async createKomponen(
    createKomponenDto: CreateKomponenNilaiDto,
    pengajarId: string,
  ) {
    // Validate kelas exists
    const kelas = await this.prisma.kelas.findUnique({
      where: { id: createKomponenDto.kelasId },
      include: {
        enrollments: {
          where: {
            userId: pengajarId,
          },
          include: {
            user: true,
          },
        },
      },
    });

    if (!kelas) {
      throw new NotFoundException(
        `Kelas with ID ${createKomponenDto.kelasId} not found`,
      );
    }

    // Validate pengajar is assigned to this kelas
    const enrollment = kelas.enrollments.find(
      (e) => e.userId === pengajarId && e.user.role === Role.PENGAJAR,
    );

    if (!enrollment) {
      throw new ForbiddenException(
        'You are not assigned as pengajar for this kelas',
      );
    }

    return await this.prisma.komponenNilai.create({
      data: {
        ...createKomponenDto,
        createdBy: pengajarId,
      },
      include: {
        kelas: {
          include: {
            semester: true,
            mataPelajaran: true,
          },
        },
      },
    });
  }

  async getKomponenByKelas(kelasId: string) {
    const kelas = await this.prisma.kelas.findUnique({
      where: { id: kelasId },
    });

    if (!kelas) {
      throw new NotFoundException(`Kelas with ID ${kelasId} not found`);
    }

    return await this.prisma.komponenNilai.findMany({
      where: { kelasId },
      include: {
        creator: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getKomponenById(id: string) {
    const komponen = await this.prisma.komponenNilai.findUnique({
      where: { id },
      include: {
        kelas: {
          include: {
            semester: true,
            mataPelajaran: true,
          },
        },
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

    if (!komponen) {
      throw new NotFoundException(`Komponen Nilai with ID ${id} not found`);
    }

    return komponen;
  }

  async updateKomponen(
    id: string,
    updateKomponenDto: UpdateKomponenNilaiDto,
    pengajarId: string,
  ) {
    const komponen = await this.prisma.komponenNilai.findUnique({
      where: { id },
    });

    if (!komponen) {
      throw new NotFoundException(`Komponen Nilai with ID ${id} not found`);
    }

    // Validate pengajar is the creator
    if (komponen.createdBy !== pengajarId) {
      throw new ForbiddenException(
        'You can only update komponen that you created',
      );
    }

    return await this.prisma.komponenNilai.update({
      where: { id },
      data: updateKomponenDto,
    });
  }

  async deleteKomponen(id: string, pengajarId: string) {
    const komponen = await this.prisma.komponenNilai.findUnique({
      where: { id },
    });

    if (!komponen) {
      throw new NotFoundException(`Komponen Nilai with ID ${id} not found`);
    }

    // Validate pengajar is the creator
    if (komponen.createdBy !== pengajarId) {
      throw new ForbiddenException(
        'You can only delete komponen that you created',
      );
    }

    return await this.prisma.komponenNilai.delete({
      where: { id },
    });
  }

  // ==================== NILAI ====================

  async entryNilai(entryNilaiDto: EntryNilaiDto, pengajarId: string) {
    // Validate komponen exists
    const komponen = await this.prisma.komponenNilai.findUnique({
      where: { id: entryNilaiDto.komponenId },
      include: {
        kelas: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    if (!komponen) {
      throw new NotFoundException(
        `Komponen Nilai with ID ${entryNilaiDto.komponenId} not found`,
      );
    }

    // Validate pengajar is creator of komponen
    if (komponen.createdBy !== pengajarId) {
      throw new ForbiddenException(
        'You can only entry nilai for komponen that you created',
      );
    }

    // Validate pelajar exists and is PELAJAR role
    const pelajar = await this.prisma.user.findUnique({
      where: { id: entryNilaiDto.pelajarId },
    });

    if (!pelajar) {
      throw new NotFoundException(
        `User with ID ${entryNilaiDto.pelajarId} not found`,
      );
    }

    if (pelajar.role !== Role.PELAJAR) {
      throw new BadRequestException('User must have PELAJAR role');
    }

    // Validate pelajar is enrolled in the kelas
    const enrollment = komponen.kelas.enrollments.find(
      (e) => e.userId === entryNilaiDto.pelajarId,
    );

    if (!enrollment) {
      throw new BadRequestException('Pelajar is not enrolled in this kelas');
    }

    // Upsert nilai (create or update)
    const nilai = await this.prisma.nilai.upsert({
      where: {
        komponenId_userId: {
          komponenId: entryNilaiDto.komponenId,
          userId: entryNilaiDto.pelajarId,
        },
      },
      create: {
        komponenId: entryNilaiDto.komponenId,
        userId: entryNilaiDto.pelajarId,
        nilai: entryNilaiDto.nilai,
      },
      update: {
        nilai: entryNilaiDto.nilai,
      },
      include: {
        komponen: {
          include: {
            kelas: {
              include: {
                semester: true,
                mataPelajaran: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Nilai berhasil diinput',
      nilai,
    };
  }

  async updateNilai(
    id: string,
    updateNilaiDto: UpdateNilaiDto,
    pengajarId: string,
  ) {
    const nilai = await this.prisma.nilai.findUnique({
      where: { id },
      include: {
        komponen: true,
      },
    });

    if (!nilai) {
      throw new NotFoundException(`Nilai with ID ${id} not found`);
    }

    // Validate pengajar is creator of komponen
    if (nilai.komponen.createdBy !== pengajarId) {
      throw new ForbiddenException(
        'You can only update nilai for komponen that you created',
      );
    }

    return await this.prisma.nilai.update({
      where: { id },
      data: { nilai: updateNilaiDto.nilai },
      include: {
        komponen: true,
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    });
  }

  async getNilaiByKelas(kelasId: string, pengajarId: string) {
    // Validate kelas exists and pengajar is assigned
    const kelas = await this.prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        enrollments: {
          where: {
            userId: pengajarId,
          },
        },
      },
    });

    if (!kelas) {
      throw new NotFoundException(`Kelas with ID ${kelasId} not found`);
    }

    if (kelas.enrollments.length === 0) {
      throw new ForbiddenException(
        'You are not assigned as pengajar for this kelas',
      );
    }

    // Get all komponen nilai for this kelas
    const komponenList = await this.prisma.komponenNilai.findMany({
      where: { kelasId },
      include: {
        nilai: {
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
      orderBy: { createdAt: 'asc' },
    });

    return komponenList;
  }

  async getMyNilai(userId: string): Promise<GroupedNilai[]> {
    // Get all nilai for this user
    const nilaiList = await this.prisma.nilai.findMany({
      where: { userId },
      include: {
        komponen: {
          include: {
            kelas: {
              include: {
                semester: true,
                mataPelajaran: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by kelas
    const groupedByKelas = nilaiList.reduce(
      (acc, nilai) => {
        const kelasId = nilai.komponen.kelas.id;
        if (!acc[kelasId]) {
          acc[kelasId] = {
            kelas: nilai.komponen.kelas,
            nilaiList: [],
          };
        }
        acc[kelasId].nilaiList.push({
          id: nilai.id,
          nilai: nilai.nilai,
          komponen: {
            id: nilai.komponen.id,
            nama: nilai.komponen.nama,
            bobot: nilai.komponen.bobot ?? 0,
          },
          createdAt: nilai.createdAt,
          updatedAt: nilai.updatedAt,
        });
        return acc;
      },
      {} as Record<string, GroupedNilai>,
    );

    return Object.values(groupedByKelas);
  }

  async deleteNilai(id: string, pengajarId: string) {
    const nilai = await this.prisma.nilai.findUnique({
      where: { id },
      include: {
        komponen: true,
      },
    });

    if (!nilai) {
      throw new NotFoundException(`Nilai with ID ${id} not found`);
    }

    // Validate pengajar is creator of komponen
    if (nilai.komponen.createdBy !== pengajarId) {
      throw new ForbiddenException(
        'You can only delete nilai for komponen that you created',
      );
    }

    return await this.prisma.nilai.delete({
      where: { id },
    });
  }
}
