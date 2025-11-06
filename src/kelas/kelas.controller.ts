import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { KelasService } from './kelas.service';
import {
  CreateKelasDto,
  UpdateKelasDto,
  EnrollPelajarDto,
  AssignPengajarDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('kelas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KelasController {
  constructor(private readonly kelasService: KelasService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createKelasDto: CreateKelasDto) {
    return this.kelasService.create(createKelasDto);
  }

  @Get()
  findAll() {
    return this.kelasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kelasService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateKelasDto: UpdateKelasDto) {
    return this.kelasService.update(id, updateKelasDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.kelasService.remove(id);
  }

  @Post(':id/enroll-pelajar')
  @Roles(Role.ADMIN)
  enrollPelajar(
    @Param('id') id: string,
    @Body() enrollPelajarDto: EnrollPelajarDto,
  ) {
    return this.kelasService.enrollPelajar(id, enrollPelajarDto);
  }

  @Post(':id/assign-pengajar')
  @Roles(Role.ADMIN)
  assignPengajar(
    @Param('id') id: string,
    @Body() assignPengajarDto: AssignPengajarDto,
  ) {
    return this.kelasService.assignPengajar(id, assignPengajarDto);
  }

  @Delete(':id/unenroll/:userId')
  @Roles(Role.ADMIN)
  unenroll(@Param('id') id: string, @Param('userId') userId: string) {
    return this.kelasService.unenroll(id, userId);
  }
}
