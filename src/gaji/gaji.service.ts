import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateGajiDto, UpdateGajiDto } from './dto';

@Injectable()
export class GajiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGajiDto: CreateGajiDto) {
    // Validate user exists and is PENGAJAR
    const user = await this.prisma.user.findUnique({
      where: { id: createGajiDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createGajiDto.userId} not found`,
      );
    }

    if (user.role !== Role.PENGAJAR) {
      throw new BadRequestException('Gaji can only be assigned to PENGAJAR');
    }

    // Check for duplicate
    const existing = await this.prisma.gaji.findUnique({
      where: {
        userId_bulan_tahun: {
          userId: createGajiDto.userId,
          bulan: createGajiDto.bulan,
          tahun: createGajiDto.tahun,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Gaji for ${createGajiDto.bulan} ${createGajiDto.tahun} already exists for this user`,
      );
    }

    return await this.prisma.gaji.create({
      data: createGajiDto,
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
  }

  async findAll() {
    return await this.prisma.gaji.findMany({
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    });
  }

  async findByPengajar(pengajarId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: pengajarId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${pengajarId} not found`);
    }

    if (user.role !== Role.PENGAJAR) {
      throw new BadRequestException('User is not a PENGAJAR');
    }

    return await this.prisma.gaji.findMany({
      where: { userId: pengajarId },
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    });
  }

  async findMyGaji(userId: string) {
    return await this.prisma.gaji.findMany({
      where: { userId },
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    });
  }

  async findOne(id: string) {
    const gaji = await this.prisma.gaji.findUnique({
      where: { id },
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

    if (!gaji) {
      throw new NotFoundException(`Gaji with ID ${id} not found`);
    }

    return gaji;
  }

  async update(id: string, updateGajiDto: UpdateGajiDto) {
    await this.findOne(id);

    return await this.prisma.gaji.update({
      where: { id },
      data: updateGajiDto,
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
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.gaji.delete({
      where: { id },
    });
  }
}
