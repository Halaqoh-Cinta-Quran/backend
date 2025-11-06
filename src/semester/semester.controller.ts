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
import { SemesterService } from './semester.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

@Controller('semesters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createSemesterDto: CreateSemesterDto) {
    return this.semesterService.create(createSemesterDto);
  }

  @Get()
  @Roles('ADMIN', 'PENGAJAR', 'PELAJAR')
  findAll() {
    return this.semesterService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'PENGAJAR', 'PELAJAR')
  findOne(@Param('id') id: string) {
    return this.semesterService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    return this.semesterService.update(id, updateSemesterDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.semesterService.remove(id);
  }
}
