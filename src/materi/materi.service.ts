import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriSectionDto } from './dto/create-materi-section.dto';
import { UpdateMateriSectionDto } from './dto/update-materi-section.dto';
import { CreateMateriFileDto } from './dto/create-materi-file.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MateriService {
  constructor(private prisma: PrismaService) {}

  // MateriSection CRUD
  async createSection(createDto: CreateMateriSectionDto, pengajarId: string) {
    // Validasi pengajar di-assign ke kelas tersebut
    const kelas = await this.prisma.kelas.findUnique({
      where: { id: createDto.kelasId },
      include: {
        enrollments: {
          where: {
            user: { role: 'PENGAJAR' },
          },
        },
      },
    });

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    const isAssigned = kelas.enrollments.some(
      (enrollment) => enrollment.userId === pengajarId,
    );

    if (!isAssigned) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
    }

    return this.prisma.materiSection.create({
      data: {
        kelasId: createDto.kelasId,
        judul: createDto.judul,
        deskripsi: createDto.deskripsi,
        createdBy: pengajarId,
      },
      include: {
        kelas: {
          select: {
            namaKelas: true,
            mataPelajaran: { select: { nama: true } },
          },
        },
        files: true,
      },
    });
  }

  async findAllByKelas(kelasId: string) {
    return this.prisma.materiSection.findMany({
      where: { kelasId },
      include: {
        files: true,
        kelas: {
          select: {
            namaKelas: true,
            mataPelajaran: { select: { nama: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneSection(id: string) {
    const section = await this.prisma.materiSection.findUnique({
      where: { id },
      include: {
        files: true,
        kelas: {
          select: {
            namaKelas: true,
            mataPelajaran: { select: { nama: true } },
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Materi section tidak ditemukan');
    }

    return section;
  }

  async updateSection(
    id: string,
    updateDto: UpdateMateriSectionDto,
    pengajarId: string,
  ) {
    const section = await this.prisma.materiSection.findUnique({
      where: { id },
      include: {
        kelas: {
          include: {
            enrollments: {
              where: {
                user: { role: 'PENGAJAR' },
              },
            },
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Materi section tidak ditemukan');
    }

    const isAssigned = section.kelas.enrollments.some(
      (enrollment) => enrollment.userId === pengajarId,
    );

    if (!isAssigned) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini');
    }

    return this.prisma.materiSection.update({
      where: { id },
      data: updateDto,
      include: {
        files: true,
        kelas: {
          select: {
            namaKelas: true,
            mataPelajaran: { select: { nama: true } },
          },
        },
      },
    });
  }

  async removeSection(id: string, pengajarId: string) {
    const section = await this.prisma.materiSection.findUnique({
      where: { id },
      include: {
        kelas: {
          include: {
            enrollments: {
              where: {
                user: { role: 'PENGAJAR' },
              },
            },
          },
        },
        files: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Materi section tidak ditemukan');
    }

    const isAssigned = section.kelas.enrollments.some(
      (enrollment) => enrollment.userId === pengajarId,
    );

    if (!isAssigned) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini');
    }

    // Delete all files from disk
    for (const file of section.files) {
      const filePath = path.join(process.cwd(), 'uploads', file.filepath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return this.prisma.materiSection.delete({
      where: { id },
    });
  }

  // MateriFile CRUD
  async uploadFile(
    createDto: CreateMateriFileDto,
    file: Express.Multer.File,
    pengajarId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const section = await this.prisma.materiSection.findUnique({
      where: { id: createDto.materiSectionId },
      include: {
        kelas: {
          include: {
            enrollments: {
              where: {
                user: { role: 'PENGAJAR' },
              },
            },
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Materi section tidak ditemukan');
    }

    const isAssigned = section.kelas.enrollments.some(
      (enrollment) => enrollment.userId === pengajarId,
    );

    if (!isAssigned) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini');
    }

    return this.prisma.materiFile.create({
      data: {
        sectionId: createDto.materiSectionId,
        judul: file.originalname,
        filename: file.originalname,
        filepath: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      },
      include: {
        section: {
          select: {
            judul: true,
            kelas: { select: { namaKelas: true } },
          },
        },
      },
    });
  }

  async findAllFiles(materiSectionId: string) {
    return this.prisma.materiFile.findMany({
      where: { sectionId: materiSectionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFileById(id: string) {
    const file = await this.prisma.materiFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    const filePath = path.join(process.cwd(), 'uploads', file.filepath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File tidak ditemukan di storage');
    }

    return { file, filePath };
  }

  async deleteFile(id: string, pengajarId: string) {
    const materiFile = await this.prisma.materiFile.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            kelas: {
              include: {
                enrollments: {
                  where: {
                    user: { role: 'PENGAJAR' },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!materiFile) {
      throw new NotFoundException('File tidak ditemukan');
    }

    const isAssigned = materiFile.section.kelas.enrollments.some(
      (enrollment) => enrollment.userId === pengajarId,
    );

    if (!isAssigned) {
      throw new ForbiddenException('Anda tidak memiliki akses ke file ini');
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'uploads', materiFile.filepath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.materiFile.delete({
      where: { id },
    });
  }
}
