import { PrismaClient, Role, SemesterStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  console.log('⚠️  WARNING: These are DEFAULT DEVELOPMENT credentials.');
  console.log('⚠️  CHANGE ALL PASSWORDS immediately in production!');

  // Create Admin User
  const adminPassword = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hcq.com' },
    update: {},
    create: {
      email: 'admin@hcq.com',
      password: adminPassword,
      nama: 'Administrator',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create Sample Pengajar
  const pengajarPassword = await argon2.hash('pengajar123');
  const pengajar = await prisma.user.upsert({
    where: { email: 'pengajar@hcq.com' },
    update: {},
    create: {
      email: 'pengajar@hcq.com',
      password: pengajarPassword,
      nama: 'Ustadz Ahmad',
      role: Role.PENGAJAR,
    },
  });

  console.log('✅ Pengajar created:', pengajar.email);

  // Create Sample Pelajar
  const pelajarPassword = await argon2.hash('pelajar123');
  const pelajar = await prisma.user.upsert({
    where: { email: 'pelajar@hcq.com' },
    update: {},
    create: {
      email: 'pelajar@hcq.com',
      password: pelajarPassword,
      nama: 'Muhammad Faiz',
      role: Role.PELAJAR,
    },
  });

  console.log('✅ Pelajar created:', pelajar.email);

  // Create Sample Semester
  const semester = await prisma.semester.upsert({
    where: { id: 'semester-1' },
    update: {},
    create: {
      id: 'semester-1',
      nama: 'Ganjil 2025/2026',
      tanggalMulai: new Date('2025-08-01'),
      tanggalAkhir: new Date('2025-12-31'),
      status: SemesterStatus.AKTIF,
    },
  });

  console.log('✅ Semester created:', semester.nama);

  // Create Sample Mata Pelajaran
  const mataPelajaran1 = await prisma.mataPelajaran.upsert({
    where: { kode: 'THS001' },
    update: {},
    create: {
      nama: 'Tahsin',
      kode: 'THS001',
      deskripsi: 'Perbaikan bacaan Al-Quran',
    },
  });

  const mataPelajaran2 = await prisma.mataPelajaran.upsert({
    where: { kode: 'THF001' },
    update: {},
    create: {
      nama: 'Tahfidz',
      kode: 'THF001',
      deskripsi: 'Hafalan Al-Quran',
    },
  });

  console.log(
    '✅ Mata Pelajaran created:',
    mataPelajaran1.nama,
    mataPelajaran2.nama,
  );

  // Create 30 Global Announcements for pagination testing
  console.log('📢 Creating 30 global announcements...');
  const announcementTitles = [
    'Libur Semester Ganjil',
    'Pendaftaran Semester Genap Dibuka',
    'Ujian Tengah Semester',
    'Peringatan Maulid Nabi Muhammad SAW',
    'Kegiatan Ramadhan 1446 H',
    'Libur Idul Fitri',
    'Pembagian Rapor Semester',
    'Rapat Wali Murid',
    'Kegiatan Pesantren Kilat',
    'Lomba Tahfidz Tingkat Nasional',
    'Penerimaan Santri Baru',
    'Jadwal Imtihan Tahfidz',
    'Pelatihan Guru Ngaji',
    'Seminar Pendidikan Islam',
    'Bakti Sosial Bulan Muharram',
    'Libur Nasional',
    'Kegiatan Halaqah Mingguan',
    'Pembayaran SPP Bulan Ini',
    'Update Kurikulum Pembelajaran',
    'Tes Kemampuan Membaca Al-Quran',
    'Wisuda Hafizh',
    'Khataman Al-Quran Bersama',
    "Kajian Tafsir Setiap Jum'at",
    'Pengumuman Hasil Ujian',
    'Perubahan Jadwal Kelas',
    'Libur Hari Raya Idul Adha',
    'Qurban Bersama',
    'Kegiatan Belajar Outdoor',
    'Pemberitahuan Penting',
    'Info Beasiswa Tahfidz',
  ];

  const announcementContents = [
    'Semester ganjil akan libur mulai tanggal 20 Desember 2025',
    'Pendaftaran untuk semester genap sudah dibuka. Silakan daftar di kantor administrasi',
    'Ujian tengah semester akan dilaksanakan minggu depan. Harap mempersiapkan diri',
    'Dalam rangka memperingati Maulid Nabi, akan diadakan acara istighotsah',
    'Kegiatan ramadhan meliputi tadarus bersama dan kajian kitab',
    'Libur lebaran akan dimulai H-3 sampai H+7',
    'Rapor dapat diambil di kantor pada hari Sabtu',
    'Rapat wali murid akan diselenggarakan akhir bulan ini',
    'Pesantren kilat diadakan selama 3 hari di bulan Ramadhan',
    'Lomba tahfidz akan diikuti oleh para santri pilihan',
    'Penerimaan santri baru gelombang 1 sudah dibuka',
    'Jadwal imtihan tahfidz untuk bulan ini telah ditentukan',
    'Pelatihan untuk meningkatkan kualitas pengajaran ngaji',
    'Seminar dengan tema pendidikan karakter islami',
    'Bakti sosial kepada masyarakat sekitar',
    'Libur nasional sesuai kalender pemerintah',
    'Halaqah rutin setiap hari Ahad setelah shalat Dzuhur',
    'Harap segera melunasi pembayaran SPP',
    'Kurikulum diperbarui sesuai standar nasional',
    'Tes untuk mengukur kemampuan baca Al-Quran santri',
    'Wisuda bagi para hafizh yang telah menyelesaikan 30 juz',
    'Khataman bersama akan dilaksanakan akhir bulan',
    "Kajian tafsir rutin setiap Jum'at ba'da Ashar",
    'Hasil ujian dapat dilihat di papan pengumuman',
    'Ada perubahan jadwal untuk beberapa kelas',
    'Libur Idul Adha dimulai H-1 sampai H+3',
    'Kegiatan qurban dilaksanakan setelah shalat Idul Adha',
    'Belajar outdoor untuk mengenal alam ciptaan Allah',
    'Pemberitahuan penting terkait kegiatan pembelajaran',
    'Informasi beasiswa untuk santri berprestasi dalam tahfidz',
  ];

  for (let i = 0; i < 30; i++) {
    await prisma.announcement.create({
      data: {
        judul: announcementTitles[i],
        isi: announcementContents[i],
        scope: 'GLOBAL',
        createdBy: admin.id,
      },
    });
  }

  console.log('✅ 30 global announcements created');

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Default credentials:');
  console.log('Admin: admin@hcq.com / admin123');
  console.log('Pengajar: pengajar@hcq.com / pengajar123');
  console.log('Pelajar: pelajar@hcq.com / pelajar123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
