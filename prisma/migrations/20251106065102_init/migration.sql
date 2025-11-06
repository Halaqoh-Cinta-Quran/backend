-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PENGAJAR', 'PELAJAR');

-- CreateEnum
CREATE TYPE "SemesterStatus" AS ENUM ('AKTIF', 'MENDATANG', 'SELESAI');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('LUNAS', 'BELUM_LUNAS');

-- CreateEnum
CREATE TYPE "StatusPresensi" AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALFA');

-- CreateEnum
CREATE TYPE "AnnouncementScope" AS ENUM ('GLOBAL', 'KELAS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3) NOT NULL,
    "status" "SemesterStatus" NOT NULL DEFAULT 'MENDATANG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "namaKelas" TEXT NOT NULL,
    "jadwalHari" TEXT,
    "jadwalJam" TEXT,
    "semesterId" TEXT NOT NULL,
    "mataPelajaranId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presensi_sessions" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presensi_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presensi_records" (
    "id" TEXT NOT NULL,
    "presensiSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "StatusPresensi" NOT NULL DEFAULT 'HADIR',
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presensi_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komponen_nilai" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" DOUBLE PRECISION DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "komponen_nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai" (
    "id" TEXT NOT NULL,
    "komponenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materi_sections" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materi_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materi_files" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "mimetype" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materi_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagihan_spp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "bulan" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'BELUM_LUNAS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagihan_spp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaji" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "bulan" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'BELUM_LUNAS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gaji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "scope" "AnnouncementScope" NOT NULL DEFAULT 'GLOBAL',
    "kelasId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mata_pelajaran_kode_key" ON "mata_pelajaran"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userId_kelasId_key" ON "enrollments"("userId", "kelasId");

-- CreateIndex
CREATE UNIQUE INDEX "presensi_sessions_kode_key" ON "presensi_sessions"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "presensi_records_presensiSessionId_userId_key" ON "presensi_records"("presensiSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_komponenId_userId_key" ON "nilai"("komponenId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tagihan_spp_userId_bulan_tahun_key" ON "tagihan_spp"("userId", "bulan", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "gaji_userId_bulan_tahun_key" ON "gaji"("userId", "bulan", "tahun");

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "mata_pelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presensi_sessions" ADD CONSTRAINT "presensi_sessions_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presensi_records" ADD CONSTRAINT "presensi_records_presensiSessionId_fkey" FOREIGN KEY ("presensiSessionId") REFERENCES "presensi_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presensi_records" ADD CONSTRAINT "presensi_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komponen_nilai" ADD CONSTRAINT "komponen_nilai_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komponen_nilai" ADD CONSTRAINT "komponen_nilai_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_komponenId_fkey" FOREIGN KEY ("komponenId") REFERENCES "komponen_nilai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi_sections" ADD CONSTRAINT "materi_sections_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi_sections" ADD CONSTRAINT "materi_sections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi_files" ADD CONSTRAINT "materi_files_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "materi_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan_spp" ADD CONSTRAINT "tagihan_spp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaji" ADD CONSTRAINT "gaji_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
