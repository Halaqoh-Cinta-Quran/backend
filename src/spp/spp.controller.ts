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
import { SppService } from './spp.service';
import { CreateTagihanSPPDto, UpdateTagihanSPPDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('spp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SppController {
  constructor(private readonly sppService: SppService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTagihanSPPDto: CreateTagihanSPPDto) {
    return this.sppService.create(createTagihanSPPDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.sppService.findAll();
  }

  @Get('pelajar/:id')
  @Roles(Role.ADMIN)
  findByPelajar(@Param('id') id: string) {
    return this.sppService.findByPelajar(id);
  }

  @Get('saya')
  @Roles(Role.PELAJAR)
  findMyTagihan(@Request() req: any) {
    return this.sppService.findMyTagihan(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.sppService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTagihanSPPDto: UpdateTagihanSPPDto,
  ) {
    return this.sppService.update(id, updateTagihanSPPDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.sppService.remove(id);
  }
}
