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
