import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GajiService } from './gaji.service';
import { CreateGajiDto, UpdateGajiDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('gaji')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GajiController {
  constructor(private readonly gajiService: GajiService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createGajiDto: CreateGajiDto) {
    return this.gajiService.create(createGajiDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.gajiService.findAll();
  }

  @Get('pengajar/:id')
  @Roles(Role.ADMIN)
  findByPengajar(@Param('id') id: string) {
    return this.gajiService.findByPengajar(id);
  }

  @Get('saya')
  @Roles(Role.PENGAJAR)
  findMyGaji(@Request() req: any) {
    return this.gajiService.findMyGaji(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.gajiService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateGajiDto: UpdateGajiDto) {
    return this.gajiService.update(id, updateGajiDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.gajiService.remove(id);
  }
}
