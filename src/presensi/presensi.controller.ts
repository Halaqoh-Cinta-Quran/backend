import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PresensiService } from './presensi.service';
import { HadirDto, PresensiManualDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('presensi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post('kelas/:id/mulai')
  @Roles(Role.PENGAJAR)
  mulaiKelas(@Param('id') id: string, @Request() req: any) {
    return this.presensiService.mulaiKelas(id, req.user.sub);
  }

  @Post('hadir')
  @Roles(Role.PELAJAR)
  hadir(@Body() hadirDto: HadirDto, @Request() req: any) {
    return this.presensiService.hadir(hadirDto, req.user.sub);
  }

  @Post('session/:id/manual')
  @Roles(Role.PENGAJAR)
  presensiManual(
    @Param('id') id: string,
    @Body() presensiManualDto: PresensiManualDto,
    @Request() req: any,
  ) {
    return this.presensiService.presensiManual(
      id,
      presensiManualDto,
      req.user.sub,
    );
  }

  @Get('session/:id')
  @Roles(Role.PENGAJAR, Role.ADMIN)
  getPresensiBySession(@Param('id') id: string) {
    return this.presensiService.getPresensiBySession(id);
  }

  @Get('riwayat')
  @Roles(Role.PELAJAR)
  getRiwayatPresensi(@Request() req: any) {
    return this.presensiService.getRiwayatPresensi(req.user.sub);
  }
}
