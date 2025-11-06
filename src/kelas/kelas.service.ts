import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  CreateKelasDto,
  UpdateKelasDto,
  EnrollPelajarDto,
  AssignPengajarDto,
} from './dto';

@Injectable()
export class KelasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createKelasDto: CreateKelasDto) {
    // Validate semester exists
    const semester = await this.prisma.semester.findUnique({
      where: { id: createKelasDto.semesterId },
    });
    if (!semester) {
      throw new NotFoundException(
        `Semester with ID ${createKelasDto.semesterId} not found`,
      );
    }

    // Validate mata pelajaran exists
    const mataPelajaran = await this.prisma.mataPelajaran.findUnique({
      where: { id: createKelasDto.mataPelajaranId },
    });
    if (!mataPelajaran) {
      throw new NotFoundException(
        `Mata Pelajaran with ID ${createKelasDto.mataPelajaranId} not found`,
      );
    }

    return await this.prisma.kelas.create({
      data: createKelasDto,
      include: {
        semester: true,
        mataPelajaran: true,
      },
    });
  }

  async findAll() {
    return await this.prisma.kelas.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const kelas = await this.prisma.kelas.findUnique({
      where: { id },
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
      throw new NotFoundException(`Kelas with ID ${id} not found`);
    }

    return kelas;
  }

  async update(id: string, updateKelasDto: UpdateKelasDto) {
    await this.findOne(id);

    return await this.prisma.kelas.update({
      where: { id },
      data: updateKelasDto,
      include: {
        semester: true,
        mataPelajaran: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.kelas.delete({
      where: { id },
    });
  }

  async enrollPelajar(kelasId: string, enrollPelajarDto: EnrollPelajarDto) {
    // Validate kelas exists
    await this.findOne(kelasId);

    // Validate user is a PELAJAR
    const user = await this.prisma.user.findUnique({
      where: { id: enrollPelajarDto.pelajarId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${enrollPelajarDto.pelajarId} not found`,
      );
    }

    if (user.role !== Role.PELAJAR) {
      throw new BadRequestException('User must have PELAJAR role');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_kelasId: {
          userId: enrollPelajarDto.pelajarId,
          kelasId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Pelajar already enrolled in this kelas');
    }

    return await this.prisma.enrollment.create({
      data: {
        userId: enrollPelajarDto.pelajarId,
        kelasId,
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
        kelas: {
          include: {
            semester: true,
            mataPelajaran: true,
          },
        },
      },
    });
  }

  async assignPengajar(kelasId: string, assignPengajarDto: AssignPengajarDto) {
    // Validate kelas exists
    await this.findOne(kelasId);

    // Validate user is a PENGAJAR
    const user = await this.prisma.user.findUnique({
      where: { id: assignPengajarDto.pengajarId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${assignPengajarDto.pengajarId} not found`,
      );
    }

    if (user.role !== Role.PENGAJAR) {
      throw new BadRequestException('User must have PENGAJAR role');
    }

    // Check if already assigned
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_kelasId: {
          userId: assignPengajarDto.pengajarId,
          kelasId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Pengajar already assigned to this kelas');
    }

    return await this.prisma.enrollment.create({
      data: {
        userId: assignPengajarDto.pengajarId,
        kelasId,
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
        kelas: {
          include: {
            semester: true,
            mataPelajaran: true,
          },
        },
      },
    });
  }

  async unenroll(kelasId: string, userId: string) {
    await this.findOne(kelasId);

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_kelasId: {
          userId,
          kelasId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return await this.prisma.enrollment.delete({
      where: {
        userId_kelasId: {
          userId,
          kelasId,
        },
      },
    });
  }
}
