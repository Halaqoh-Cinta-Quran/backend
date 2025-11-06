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
import { MataPelajaranService } from './mata-pelajaran.service';
import { CreateMataPelajaranDto, UpdateMataPelajaranDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('mata-pelajaran')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MataPelajaranController {
  constructor(private readonly mataPelajaranService: MataPelajaranService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createMataPelajaranDto: CreateMataPelajaranDto) {
    return this.mataPelajaranService.create(createMataPelajaranDto);
  }

  @Get()
  findAll() {
    return this.mataPelajaranService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mataPelajaranService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateMataPelajaranDto: UpdateMataPelajaranDto,
  ) {
    return this.mataPelajaranService.update(id, updateMataPelajaranDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.mataPelajaranService.remove(id);
  }
}
