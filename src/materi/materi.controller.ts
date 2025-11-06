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
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { MateriService } from './materi.service';
import { CreateMateriSectionDto } from './dto/create-materi-section.dto';
import { UpdateMateriSectionDto } from './dto/update-materi-section.dto';
import { CreateMateriFileDto } from './dto/create-materi-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response, Request } from 'express';
import * as fs from 'fs';

@Controller('materi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MateriController {
  constructor(private readonly materiService: MateriService) {}

  // MateriSection endpoints
  @Post('section')
  @Roles('PENGAJAR')
  createSection(
    @Body() createDto: CreateMateriSectionDto,
    @Req() req: Request,
  ) {
    return this.materiService.createSection(createDto, req.user!.sub);
  }

  @Get('section/kelas/:kelasId')
  findAllByKelas(@Param('kelasId') kelasId: string) {
    return this.materiService.findAllByKelas(kelasId);
  }

  @Get('section/:id')
  findOneSection(@Param('id') id: string) {
    return this.materiService.findOneSection(id);
  }

  @Patch('section/:id')
  @Roles('PENGAJAR')
  updateSection(
    @Param('id') id: string,
    @Body() updateDto: UpdateMateriSectionDto,
    @Req() req: Request,
  ) {
    return this.materiService.updateSection(id, updateDto, req.user!.sub);
  }

  @Delete('section/:id')
  @Roles('PENGAJAR')
  removeSection(@Param('id') id: string, @Req() req: Request) {
    return this.materiService.removeSection(id, req.user!.sub);
  }

  // MateriFile endpoints
  @Post('file')
  @Roles('PENGAJAR')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, callback) => {
        // Allow common document, image, and video formats
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/mpeg',
          'text/plain',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              'Invalid file type. Only PDF, DOC, PPT, images, and videos are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  uploadFile(
    @Body() createDto: CreateMateriFileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.materiService.uploadFile(createDto, file, req.user!.sub);
  }

  @Get('file/section/:materiSectionId')
  findAllFiles(@Param('materiSectionId') materiSectionId: string) {
    return this.materiService.findAllFiles(materiSectionId);
  }

  @Get('file/download/:id')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { file, filePath } = await this.materiService.getFileById(id);

    const stream = fs.createReadStream(filePath);

    res.set({
      'Content-Type': file.mimetype || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.size || 0,
    });

    return new StreamableFile(stream);
  }

  @Delete('file/:id')
  @Roles('PENGAJAR')
  deleteFile(@Param('id') id: string, @Req() req: Request) {
    return this.materiService.deleteFile(id, req.user!.sub);
  }
}
