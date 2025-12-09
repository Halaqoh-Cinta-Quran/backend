import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HadirDto, PresensiManualDto } from './dto';
import { Role, StatusPresensi } from '@prisma/client';

@Injectable()
export class PresensiService {
  constructor(private readonly prisma: PrismaService) {}

  private generateKode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async mulaiKelas(kelasId: string, pengajarId: string) {
    // Validate kelas exists
    const kelas = await this.prisma.kelas.findUnique({
      where: { id: kelasId },
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
      throw new NotFoundException(`Kelas with ID ${kelasId} not found`);
    }

    // Validate pengajar is enrolled in this kelas
    const enrollment = kelas.enrollments.find(
      (e) => e.userId === pengajarId && e.user.role === Role.PENGAJAR,
    );

    if (!enrollment) {
      throw new ForbiddenException(
        'You are not assigned as pengajar for this kelas',
      );
    }

    // Generate unique 6-digit code
    let kode = this.generateKode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await this.prisma.presensiSession.findUnique({
        where: { kode },
      });
      if (!existing) {
        isUnique = true;
      } else {
        kode = this.generateKode();
      }
    }

    // Create presensi session (expires in 3 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3);

    // Get all pelajar enrolled in this kelas
    const pelajarEnrollments = await this.prisma.enrollment.findMany({
      where: {
        kelasId,
        user: {
          role: Role.PELAJAR,
        },
      },
      select: {
        userId: true,
      },
    });

    const session = await this.prisma.presensiSession.create({
      data: {
        kelasId,
        kode,
        expiresAt,
        presensiRecords: {
          create: pelajarEnrollments.map((enrollment) => ({
            userId: enrollment.userId,
            status: StatusPresensi.ALFA,
            isManual: false,
          })),
        },
      },
      include: {
        kelas: {
          include: {
            semester: true,
            mataPelajaran: true,
          },
        },
        presensiRecords: {
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

    return {
      message: 'Kelas started successfully',
      kode,
      expiresAt,
      session,
    };
  }

  async hadir(hadirDto: HadirDto, userId: string) {
    const { kodePresensi } = hadirDto;

    // Find presensi session
    const session = await this.prisma.presensiSession.findUnique({
      where: { kode: kodePresensi },
      include: {
        kelas: {
          include: {
            enrollments: {
              where: {
                userId,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Kode presensi tidak valid');
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      throw new BadRequestException('Kode presensi sudah kadaluarsa');
    }

    // Check if user is enrolled in this kelas
    if (session.kelas.enrollments.length === 0) {
      throw new ForbiddenException('Anda tidak terdaftar di kelas ini');
    }

    // Update presensi record from ALFA to HADIR
    const record = await this.prisma.presensiRecord.update({
      where: {
        presensiSessionId_userId: {
          presensiSessionId: session.id,
          userId,
        },
      },
      data: {
        status: StatusPresensi.HADIR,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        presensiSession: {
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
    });

    return {
      message: 'Presensi berhasil dicatat',
      record,
    };
  }

  async presensiManual(
    sessionId: string,
    presensiManualDto: PresensiManualDto,
    pengajarId: string,
  ) {
    // Find session
    const session = await this.prisma.presensiSession.findUnique({
      where: { id: sessionId },
      include: {
        kelas: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Presensi session not found');
    }

    // Validate pengajar is assigned to this kelas
    const pengajarEnrollment = session.kelas.enrollments.find(
      (e) => e.userId === pengajarId,
    );

    if (!pengajarEnrollment) {
      throw new ForbiddenException(
        'You are not assigned as pengajar for this kelas',
      );
    }

    // Validate pelajar is enrolled in this kelas
    const pelajarEnrollment = session.kelas.enrollments.find(
      (e) => e.userId === presensiManualDto.pelajarId,
    );

    if (!pelajarEnrollment) {
      throw new BadRequestException('Pelajar not enrolled in this kelas');
    }

    // Upsert presensi record
    const record = await this.prisma.presensiRecord.upsert({
      where: {
        presensiSessionId_userId: {
          presensiSessionId: session.id,
          userId: presensiManualDto.pelajarId,
        },
      },
      create: {
        presensiSessionId: session.id,
        userId: presensiManualDto.pelajarId,
        status: presensiManualDto.status,
        isManual: true,
      },
      update: {
        status: presensiManualDto.status,
        isManual: true,
      },
      include: {
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
      message: 'Presensi manual berhasil dicatat',
      record,
    };
  }

  async getPresensiBySession(sessionId: string) {
    const session = await this.prisma.presensiSession.findUnique({
      where: { id: sessionId },
      include: {
        kelas: {
          include: {
            semester: true,
            mataPelajaran: true,
          },
        },
        presensiRecords: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Presensi session not found');
    }

    return session;
  }

  async getRiwayatPresensi(userId: string) {
    const records = await this.prisma.presensiRecord.findMany({
      where: { userId },
      include: {
        presensiSession: {
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

    return records;
  }

  async getPresensiByKelas(kelasId: string) {
    // Validate kelas exists
    const kelas = await this.prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        semester: true,
        mataPelajaran: true,
      },
    });

    if (!kelas) {
      throw new NotFoundException(`Kelas with ID ${kelasId} not found`);
    }

    // Get all presensi sessions for this kelas
    const sessions = await this.prisma.presensiSession.findMany({
      where: { kelasId },
      include: {
        presensiRecords: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      kelas,
      sessions,
    };
  }

  async stopSession(sessionId: string, pengajarId: string) {
    // Find session
    const session = await this.prisma.presensiSession.findUnique({
      where: { id: sessionId },
      include: {
        kelas: {
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
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Presensi session not found');
    }

    // Validate pengajar is assigned to this kelas
    const enrollment = session.kelas.enrollments.find(
      (e) => e.userId === pengajarId && e.user.role === Role.PENGAJAR,
    );

    if (!enrollment) {
      throw new ForbiddenException(
        'You are not assigned as pengajar for this kelas',
      );
    }

    // Set expiresAt to now to immediately expire the session
    const updatedSession = await this.prisma.presensiSession.update({
      where: { id: sessionId },
      data: {
        expiresAt: new Date(),
      },
      include: {
        kelas: {
          include: {
            semester: true,
            mataPelajaran: true,
          },
        },
        presensiRecords: {
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

    return {
      message: 'Presensi session stopped successfully',
      session: updatedSession,
    };
  }
}
