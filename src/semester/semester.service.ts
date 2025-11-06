import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto';

@Injectable()
export class SemesterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSemesterDto: CreateSemesterDto) {
    return this.prisma.semester.create({
      data: {
        ...createSemesterDto,
        tanggalMulai: new Date(createSemesterDto.tanggalMulai),
        tanggalAkhir: new Date(createSemesterDto.tanggalAkhir),
      },
    });
  }

  async findAll() {
    return this.prisma.semester.findMany({
      orderBy: {
        tanggalMulai: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const semester = await this.prisma.semester.findUnique({
      where: { id },
      include: {
        kelas: {
          include: {
            mataPelajaran: true,
          },
        },
      },
    });

    if (!semester) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    return semester;
  }

  async update(id: string, updateSemesterDto: UpdateSemesterDto) {
    await this.findOne(id);

    const dataToUpdate: any = { ...updateSemesterDto };

    if (updateSemesterDto.tanggalMulai) {
      dataToUpdate.tanggalMulai = new Date(updateSemesterDto.tanggalMulai);
    }

    if (updateSemesterDto.tanggalAkhir) {
      dataToUpdate.tanggalAkhir = new Date(updateSemesterDto.tanggalAkhir);
    }

    return this.prisma.semester.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.semester.delete({
      where: { id },
    });

    return { message: 'Semester deleted successfully' };
  }
}
