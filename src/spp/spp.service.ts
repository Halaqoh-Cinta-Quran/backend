import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateTagihanSPPDto, UpdateTagihanSPPDto } from './dto';

@Injectable()
export class SppService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTagihanSPPDto: CreateTagihanSPPDto) {
    // Validate user exists and is PELAJAR
    const user = await this.prisma.user.findUnique({
      where: { id: createTagihanSPPDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createTagihanSPPDto.userId} not found`,
      );
    }

    if (user.role !== Role.PELAJAR) {
      throw new BadRequestException('SPP can only be assigned to PELAJAR');
    }

    // Check for duplicate
    const existing = await this.prisma.tagihanSPP.findUnique({
      where: {
        userId_bulan_tahun: {
          userId: createTagihanSPPDto.userId,
          bulan: createTagihanSPPDto.bulan,
          tahun: createTagihanSPPDto.tahun,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Tagihan SPP for ${createTagihanSPPDto.bulan} ${createTagihanSPPDto.tahun} already exists for this user`,
      );
    }

    return await this.prisma.tagihanSPP.create({
      data: createTagihanSPPDto,
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
    return await this.prisma.tagihanSPP.findMany({
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

  async findByPelajar(pelajarId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: pelajarId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${pelajarId} not found`);
    }

    if (user.role !== Role.PELAJAR) {
      throw new BadRequestException('User is not a PELAJAR');
    }

    return await this.prisma.tagihanSPP.findMany({
      where: { userId: pelajarId },
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    });
  }

  async findMyTagihan(userId: string) {
    return await this.prisma.tagihanSPP.findMany({
      where: { userId },
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    });
  }

  async findOne(id: string) {
    const tagihan = await this.prisma.tagihanSPP.findUnique({
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

    if (!tagihan) {
      throw new NotFoundException(`Tagihan SPP with ID ${id} not found`);
    }

    return tagihan;
  }

  async update(id: string, updateTagihanSPPDto: UpdateTagihanSPPDto) {
    await this.findOne(id);

    return await this.prisma.tagihanSPP.update({
      where: { id },
      data: updateTagihanSPPDto,
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

    return await this.prisma.tagihanSPP.delete({
      where: { id },
    });
  }
}
