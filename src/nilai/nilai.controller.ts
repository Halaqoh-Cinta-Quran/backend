import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NilaiService } from './nilai.service';
import {
  CreateKomponenNilaiDto,
  UpdateKomponenNilaiDto,
  EntryNilaiDto,
  UpdateNilaiDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Request } from 'express';

@Controller('nilai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NilaiController {
  constructor(private readonly nilaiService: NilaiService) {}

  // ==================== KOMPONEN NILAI ====================

  @Post('komponen')
  @Roles(Role.PENGAJAR)
  createKomponen(
    @Body() createKomponenDto: CreateKomponenNilaiDto,
    @Req() req: Request,
  ) {
    return this.nilaiService.createKomponen(createKomponenDto, req.user!.sub);
  }

  @Get('komponen/kelas/:kelasId')
  getKomponenByKelas(@Param('kelasId') kelasId: string) {
    return this.nilaiService.getKomponenByKelas(kelasId);
  }

  @Get('komponen/:id')
  getKomponenById(@Param('id') id: string) {
    return this.nilaiService.getKomponenById(id);
  }

  @Patch('komponen/:id')
  @Roles(Role.PENGAJAR)
  updateKomponen(
    @Param('id') id: string,
    @Body() updateKomponenDto: UpdateKomponenNilaiDto,
    @Req() req: Request,
  ) {
    return this.nilaiService.updateKomponen(
      id,
      updateKomponenDto,
      req.user!.sub,
    );
  }

  @Delete('komponen/:id')
  @Roles(Role.PENGAJAR)
  deleteKomponen(@Param('id') id: string, @Req() req: Request) {
    return this.nilaiService.deleteKomponen(id, req.user!.sub);
  }

  // ==================== NILAI ====================

  @Post('entry')
  @Roles(Role.PENGAJAR)
  entryNilai(@Body() entryNilaiDto: EntryNilaiDto, @Req() req: Request) {
    return this.nilaiService.entryNilai(entryNilaiDto, req.user!.sub);
  }

  @Patch(':id')
  @Roles(Role.PENGAJAR)
  updateNilai(
    @Param('id') id: string,
    @Body() updateNilaiDto: UpdateNilaiDto,
    @Req() req: Request,
  ) {
    return this.nilaiService.updateNilai(id, updateNilaiDto, req.user!.sub);
  }

  @Get('kelas/:kelasId')
  @Roles(Role.PENGAJAR, Role.ADMIN)
  getNilaiByKelas(@Param('kelasId') kelasId: string, @Req() req: Request) {
    return this.nilaiService.getNilaiByKelas(kelasId, req.user!.sub);
  }

  @Get('saya')
  @Roles(Role.PELAJAR)
  getMyNilai(@Req() req: Request) {
    return this.nilaiService.getMyNilai(req.user!.sub);
  }

  @Delete(':id')
  @Roles(Role.PENGAJAR)
  deleteNilai(@Param('id') id: string, @Req() req: Request) {
    return this.nilaiService.deleteNilai(id, req.user!.sub);
  }
}
