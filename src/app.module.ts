import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SemesterModule } from './semester/semester.module';
import { MataPelajaranModule } from './mata-pelajaran/mata-pelajaran.module';
import { KelasModule } from './kelas/kelas.module';
import { PresensiModule } from './presensi/presensi.module';
import { NilaiModule } from './nilai/nilai.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { SppModule } from './spp/spp.module';
import { GajiModule } from './gaji/gaji.module';
import { MateriModule } from './materi/materi.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    SemesterModule,
    MataPelajaranModule,
    KelasModule,
    PresensiModule,
    NilaiModule,
    AnnouncementModule,
    SppModule,
    GajiModule,
    MateriModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
