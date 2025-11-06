import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMataPelajaranDto, UpdateMataPelajaranDto } from './dto';

@Injectable()
export class MataPelajaranService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMataPelajaranDto: CreateMataPelajaranDto) {
    return await this.prisma.mataPelajaran.create({
      data: createMataPelajaranDto,
    });
  }

  async findAll() {
    return await this.prisma.mataPelajaran.findMany({
      orderBy: { nama: 'asc' },
    });
  }

  async findOne(id: string) {
    const mataPelajaran = await this.prisma.mataPelajaran.findUnique({
      where: { id },
      include: {
        kelas: {
          include: {
            semester: true,
          },
        },
      },
    });

    if (!mataPelajaran) {
      throw new NotFoundException(`Mata Pelajaran with ID ${id} not found`);
    }

    return mataPelajaran;
  }

  async update(id: string, updateMataPelajaranDto: UpdateMataPelajaranDto) {
    await this.findOne(id);

    return await this.prisma.mataPelajaran.update({
      where: { id },
      data: updateMataPelajaranDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.mataPelajaran.delete({
      where: { id },
    });
  }
}
