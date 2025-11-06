import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, AnnouncementScope } from '@prisma/client';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string) {
    // Get user to check role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // GLOBAL announcements can only be created by ADMIN
    if (
      createAnnouncementDto.scope === AnnouncementScope.GLOBAL &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'Only ADMIN can create GLOBAL announcements',
      );
    }

    // KELAS announcements require kelasId
    if (
      createAnnouncementDto.scope === AnnouncementScope.KELAS &&
      !createAnnouncementDto.kelasId
    ) {
      throw new BadRequestException(
        'kelasId is required for KELAS announcements',
      );
    }

    // If KELAS scope, validate user is assigned as PENGAJAR to that kelas
    if (createAnnouncementDto.scope === AnnouncementScope.KELAS) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_kelasId: {
            userId,
            kelasId: createAnnouncementDto.kelasId!,
          },
        },
        include: {
          user: true,
        },
      });

      if (!enrollment || enrollment.user.role !== Role.PENGAJAR) {
        throw new ForbiddenException(
          'You must be assigned as PENGAJAR to create announcements for this kelas',
        );
      }
    }

    return await this.prisma.announcement.create({
      data: {
        ...createAnnouncementDto,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
        kelas: createAnnouncementDto.kelasId
          ? {
              include: {
                semester: true,
                mataPelajaran: true,
              },
            }
          : undefined,
      },
    });
  }

  async findAll(userId: string) {
    // Get user with enrollments
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get all GLOBAL announcements
    const globalAnnouncements = await this.prisma.announcement.findMany({
      where: {
        scope: AnnouncementScope.GLOBAL,
      },
      include: {
        creator: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get kelas IDs where user is enrolled
    const kelasIds = user.enrollments.map((e) => e.kelasId);

    // Get announcements for kelas where user is enrolled
    const kelasAnnouncements =
      kelasIds.length > 0
        ? await this.prisma.announcement.findMany({
            where: {
              scope: AnnouncementScope.KELAS,
              kelasId: {
                in: kelasIds,
              },
            },
            include: {
              creator: {
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
            orderBy: {
              createdAt: 'desc',
            },
          })
        : [];

    // Combine and sort by createdAt
    const allAnnouncements = [...globalAnnouncements, ...kelasAnnouncements];
    allAnnouncements.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return allAnnouncements;
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        creator: {
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

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async update(
    id: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
    userId: string,
  ) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    // Only creator or ADMIN can update
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (announcement.createdBy !== userId && user?.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You can only update announcements that you created',
      );
    }

    return await this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementDto,
      include: {
        creator: {
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

  async remove(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    // Only creator or ADMIN can delete
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (announcement.createdBy !== userId && user?.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You can only delete announcements that you created',
      );
    }

    return await this.prisma.announcement.delete({
      where: { id },
    });
  }
}
