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
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('announcement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PENGAJAR)
  create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @Request() req: any,
  ) {
    return this.announcementService.create(createAnnouncementDto, req.user.sub);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.announcementService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
    @Request() req: any,
  ) {
    return this.announcementService.update(
      id,
      updateAnnouncementDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.announcementService.remove(id, req.user.sub);
  }
}
