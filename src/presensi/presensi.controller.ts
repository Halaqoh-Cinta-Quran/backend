import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PresensiService } from './presensi.service';
import { HadirDto, PresensiManualDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Request } from 'express';

@Controller('presensi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post('kelas/:id/mulai')
  @Roles(Role.PENGAJAR)
  mulaiKelas(@Param('id') id: string, @Req() req: Request) {
    return this.presensiService.mulaiKelas(id, req.user!.sub);
  }

  @Post('hadir')
  @Roles(Role.PELAJAR)
  hadir(@Body() hadirDto: HadirDto, @Req() req: Request) {
    return this.presensiService.hadir(hadirDto, req.user!.sub);
  }

  @Post('session/:id/manual')
  @Roles(Role.PENGAJAR)
  presensiManual(
    @Param('id') id: string,
    @Body() presensiManualDto: PresensiManualDto,
    @Req() req: Request,
  ) {
    return this.presensiService.presensiManual(
      id,
      presensiManualDto,
      req.user!.sub,
    );
  }

  @Get('session/:id')
  @Roles(Role.PENGAJAR, Role.ADMIN)
  getPresensiBySession(@Param('id') id: string) {
    return this.presensiService.getPresensiBySession(id);
  }

  @Get('riwayat')
  @Roles(Role.PELAJAR)
  getRiwayatPresensi(@Req() req: Request) {
    return this.presensiService.getRiwayatPresensi(req.user!.sub);
  }

  @Get('kelas/:id')
  @Roles(Role.PENGAJAR, Role.ADMIN)
  getPresensiByKelas(@Param('id') id: string) {
    return this.presensiService.getPresensiByKelas(id);
  }

  @Post('session/:id/stop')
  @Roles(Role.PENGAJAR)
  stopSession(@Param('id') id: string, @Req() req: Request) {
    return this.presensiService.stopSession(id, req.user!.sub);
  }
}
