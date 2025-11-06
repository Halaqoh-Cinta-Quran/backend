# HCQ LMS - Complete API Documentation

> Learning Management System untuk Halaqoh Cinta Qur'an  
> **Version:** 1.0.0 | **Updated:** November 6, 2025 | **Status:** ✅ Production Ready

---

## 📑 Table of Contents

1. [Getting Started](#-getting-started)
2. [Authentication](#-authentication)
3. [REST API Endpoints](#-rest-api-endpoints)
   - [User Management](#user-management)
   - [Semester](#semester)
   - [Mata Pelajaran](#mata-pelajaran)
   - [Kelas & Enrollment](#kelas--enrollment)
   - [Presensi](#presensi)
   - [Nilai](#nilai)
   - [Materi & File Upload](#materi--file-upload)
   - [Announcement](#announcement)
   - [SPP](#spp)
   - [Gaji](#gaji)
4. [tRPC API](#-trpc-api)
5. [Authorization Matrix](#-authorization-matrix)
6. [Error Handling](#-error-handling)

---

## 🚀 Getting Started

### Base URL

```
http://localhost:3000
```

### Quick Start

**1. Install Dependencies:**

```bash
cd hcq-backend
pnpm install
```

**2. Setup Database:**

```bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/hcq_lms"
JWT_SECRET="your-secret-key"

# Run migrations & seed
pnpm prisma:migrate
pnpm prisma:seed
```

**3. Start Development Server:**

```bash
pnpm run start:dev
```

**4. Test Endpoints:**

```bash
# REST API
curl http://localhost:3000/auth/login

# tRPC API
curl http://localhost:3000/trpc/auth.login
```

---

## 🔐 Authentication

### Login

**Endpoint:** `POST /auth/login`

**Public:** Yes

**Request:**

```json
{
  "email": "admin@hcq.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@hcq.com",
    "nama": "Admin HCQ",
    "role": "ADMIN"
  }
}
```

### Register Student (Public)

**Endpoint:** `POST /auth/register/pelajar`

**Public:** Yes ✅ (No authentication required)

**Description:** Students can self-register without admin intervention.

**Request:**

```json
{
  "email": "student@example.com",
  "password": "password123",
  "nama": "Student Name"
}
```

**Response:**

```json
{
  "message": "Student registered successfully",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "nama": "Student Name",
    "role": "PELAJAR",
    "createdAt": "2025-11-06T..."
  }
}
```

**Validation:**

- Email must be valid format
- Password minimum 6 characters
- Nama (name) is required
- Role is automatically set to `PELAJAR`

### Register Staff (Admin Only)

**Endpoint:** `POST /auth/register`

**Public:** No 🔒 (Admin only)

**Headers:**

```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Description:** Only admins can create ADMIN or PENGAJAR accounts.

**Request:**

```json
{
  "email": "teacher@hcq.com",
  "password": "password123",
  "nama": "Teacher Name",
  "role": "PENGAJAR"
}
```

**Allowed Roles:** `ADMIN`, `PENGAJAR`

**Note:** Attempting to register PELAJAR through this endpoint will return 403 Forbidden. Use `/auth/register/pelajar` instead.

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "teacher@hcq.com",
    "nama": "Teacher Name",
    "role": "PENGAJAR",
    "createdAt": "2025-11-06T..."
  }
}
```

### Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@hcq.com",
  "nama": "User Name",
  "role": "PELAJAR"
}
```

### Change Password

**Endpoint:** `PATCH /auth/change-password`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Description:** Allows authenticated users to change their password.

**Request:**

```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword456"
}
```

**Validation:**

- Old password must be correct
- New password must be at least 6 characters
- New password must be different from old password

**Response:**

```json
{
  "message": "Password berhasil diubah"
}
```

**Error Responses:**

```json
// Wrong old password
{
  "statusCode": 400,
  "message": "Password lama tidak sesuai"
}

// Same password
{
  "statusCode": 400,
  "message": "Password baru tidak boleh sama dengan password lama"
}
```

### Using JWT Token

All protected endpoints require JWT token in header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Test Accounts

After running `pnpm prisma:seed`:

| Role         | Email            | Password    | Access                                  |
| ------------ | ---------------- | ----------- | --------------------------------------- |
| **ADMIN**    | admin@hcq.com    | admin123    | Full system access                      |
| **PENGAJAR** | pengajar@hcq.com | pengajar123 | Manage kelas, presensi, nilai, materi   |
| **PELAJAR**  | pelajar@hcq.com  | pelajar123  | View kelas, submit presensi, view nilai |

---

## 📡 REST API Endpoints

### User Management

#### Get All Users (Admin)

```http
GET /users
Authorization: Bearer <admin-token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "email": "user@hcq.com",
    "nama": "User Name",
    "role": "PELAJAR",
    "createdAt": "2025-11-06T..."
  }
]
```

#### Create User (Admin)

```http
POST /users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "user@hcq.com",
  "password": "password123",
  "nama": "User Name",
  "role": "PELAJAR"
}
```

**Role Options:** `ADMIN`, `PENGAJAR`, `PELAJAR`

#### Update User (Admin)

```http
PATCH /users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "nama": "Updated Name",
  "email": "newemail@hcq.com"
}
```

#### Delete User (Admin)

```http
DELETE /users/:id
Authorization: Bearer <admin-token>
```

---

### Semester

#### Get All Semesters

```http
GET /semesters
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "nama": "Ganjil 2025/2026",
    "tanggalMulai": "2025-08-01T00:00:00.000Z",
    "tanggalAkhir": "2025-12-31T00:00:00.000Z",
    "status": "AKTIF"
  }
]
```

**Status Options:** `AKTIF`, `MENDATANG`, `SELESAI`

#### Create Semester (Admin)

```http
POST /semesters
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "nama": "Genap 2025/2026",
  "tanggalMulai": "2026-01-01",
  "tanggalAkhir": "2026-06-30",
  "status": "MENDATANG"
}
```

#### Update Semester (Admin)

```http
PATCH /semesters/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "SELESAI"
}
```

#### Delete Semester (Admin)

```http
DELETE /semesters/:id
Authorization: Bearer <admin-token>
```

---

### Mata Pelajaran

#### Get All Mata Pelajaran

```http
GET /mata-pelajaran
Authorization: Bearer <token>
```

#### Create Mata Pelajaran (Admin)

```http
POST /mata-pelajaran
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "nama": "Tahsin",
  "kode": "THS",
  "deskripsi": "Pembelajaran membaca Al-Quran dengan benar"
}
```

#### Update Mata Pelajaran (Admin)

```http
PATCH /mata-pelajaran/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "deskripsi": "Updated description"
}
```

---

### Kelas & Enrollment

#### Get All Kelas

```http
GET /kelas
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "namaKelas": "Tahsin - Kelas Pagi",
    "jadwalHari": "Senin, Rabu, Jumat",
    "jadwalJam": "08:00 - 09:30",
    "semester": {
      "id": "uuid",
      "nama": "Ganjil 2025/2026",
      "status": "AKTIF"
    },
    "mataPelajaran": {
      "id": "uuid",
      "nama": "Tahsin",
      "kode": "THS"
    },
    "enrollments": [
      {
        "user": {
          "id": "uuid",
          "nama": "Ustadz Ahmad",
          "role": "PENGAJAR"
        }
      }
    ],
    "_count": {
      "enrollments": 15
    }
  }
]
```

#### Get Kelas by ID

```http
GET /kelas/:id
Authorization: Bearer <token>
```

#### Create Kelas (Admin)

```http
POST /kelas
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "namaKelas": "Tahsin - Kelas Sore",
  "jadwalHari": "Selasa, Kamis",
  "jadwalJam": "16:00 - 17:30",
  "semesterId": "uuid",
  "mataPelajaranId": "uuid"
}
```

#### Update Kelas (Admin)

```http
PATCH /kelas/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "jadwalJam": "08:30 - 10:00"
}
```

#### Enroll Pelajar to Kelas (Admin)

```http
POST /kelas/:kelasId/enroll-pelajar
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "pelajarId": "uuid"
}
```

#### Assign Pengajar to Kelas (Admin)

```http
POST /kelas/:kelasId/assign-pengajar
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "pengajarId": "uuid"
}
```

#### Remove User from Kelas (Admin)

```http
DELETE /kelas/:kelasId/unenroll/:userId
Authorization: Bearer <admin-token>
```

---

### Presensi

#### Start Kelas & Generate Code (Pengajar)

```http
POST /presensi/kelas/:kelasId/mulai
Authorization: Bearer <pengajar-token>
```

**Response:**

```json
{
  "message": "Kelas started successfully",
  "kode": "ABC123",
  "expiresAt": "2025-11-06T13:00:00.000Z",
  "session": {
    "id": "uuid",
    "kode": "ABC123",
    "tanggal": "2025-11-06T10:00:00.000Z",
    "isActive": true,
    "kelas": {
      "namaKelas": "Tahsin - Kelas Pagi"
    }
  }
}
```

**Notes:**

- Generates unique 6-digit code
- Code expires after 3 hours
- Only one active session per kelas

#### Pelajar Hadir dengan Kode

```http
POST /presensi/hadir
Authorization: Bearer <pelajar-token>
Content-Type: application/json

{
  "kodePresensi": "ABC123"
}
```

**Response:**

```json
{
  "message": "Presensi berhasil dicatat",
  "record": {
    "id": "uuid",
    "status": "HADIR",
    "timestamp": "2025-11-06T10:05:00.000Z",
    "user": {
      "nama": "Muhammad Ali"
    },
    "presensiSession": {
      "kelas": {
        "namaKelas": "Tahsin - Kelas Pagi"
      }
    }
  }
}
```

**Error Responses:**

```json
// Code not found
{ "statusCode": 404, "message": "Kode presensi tidak valid" }

// Code expired
{ "statusCode": 400, "message": "Kode presensi sudah expired" }

// Already present
{ "statusCode": 409, "message": "Anda sudah presensi untuk sesi ini" }

// Not enrolled
{ "statusCode": 403, "message": "Anda tidak terdaftar di kelas ini" }
```

#### Manual Presensi (Pengajar)

```http
POST /presensi/session/:sessionId/manual
Authorization: Bearer <pengajar-token>
Content-Type: application/json

{
  "pelajarId": "uuid",
  "status": "SAKIT"
}
```

**Status Options:** `HADIR`, `IZIN`, `SAKIT`, `ALFA`

#### Get Presensi by Session (Pengajar/Admin)

```http
GET /presensi/session/:sessionId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "session": {
    "id": "uuid",
    "kode": "ABC123",
    "tanggal": "2025-11-06T10:00:00.000Z",
    "kelas": {
      "namaKelas": "Tahsin - Kelas Pagi"
    }
  },
  "records": [
    {
      "id": "uuid",
      "status": "HADIR",
      "timestamp": "2025-11-06T10:05:00.000Z",
      "user": {
        "nama": "Muhammad Ali",
        "email": "ali@hcq.com"
      }
    },
    {
      "id": "uuid",
      "status": "SAKIT",
      "timestamp": "2025-11-06T10:10:00.000Z",
      "user": {
        "nama": "Fatimah Zahra",
        "email": "fatimah@hcq.com"
      }
    }
  ]
}
```

#### Get Riwayat Presensi (Pelajar)

```http
GET /presensi/riwayat
Authorization: Bearer <pelajar-token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "status": "HADIR",
    "timestamp": "2025-11-06T10:05:00.000Z",
    "presensiSession": {
      "tanggal": "2025-11-06T10:00:00.000Z",
      "kelas": {
        "namaKelas": "Tahsin - Kelas Pagi",
        "mataPelajaran": {
          "nama": "Tahsin"
        }
      }
    }
  }
]
```

---

### Nilai

#### Create Komponen Nilai (Pengajar)

```http
POST /nilai/komponen
Authorization: Bearer <pengajar-token>
Content-Type: application/json

{
  "kelasId": "uuid",
  "nama": "UTS",
  "bobot": 30
}
```

**Response:**

```json
{
  "id": "uuid",
  "kelasId": "uuid",
  "nama": "UTS",
  "bobot": 30,
  "createdBy": "pengajar-uuid",
  "kelas": {
    "namaKelas": "Tahsin - Kelas Pagi"
  }
}
```

**Validations:**

- ✅ Pengajar must be assigned to kelas
- ✅ `nama` is required
- ✅ `bobot` must be 0-100

#### Get Komponen by Kelas

```http
GET /nilai/komponen/kelas/:kelasId
Authorization: Bearer <token>
```

#### Entry Nilai (Pengajar)

```http
POST /nilai/entry
Authorization: Bearer <pengajar-token>
Content-Type: application/json

{
  "komponenId": "uuid",
  "pelajarId": "uuid",
  "nilai": 85.5
}
```

**Behavior:**

- Creates new nilai if not exists
- Updates existing nilai if already exists (upsert)

**Response:**

```json
{
  "message": "Nilai berhasil diinput",
  "nilai": {
    "id": "uuid",
    "nilai": 85.5,
    "komponen": {
      "nama": "UTS",
      "bobot": 30,
      "kelas": {
        "namaKelas": "Tahsin - Kelas Pagi"
      }
    },
    "user": {
      "nama": "Muhammad Ali",
      "email": "ali@hcq.com"
    }
  }
}
```

#### Update Nilai (Pengajar)

```http
PATCH /nilai/:id
Authorization: Bearer <pengajar-token>
Content-Type: application/json

{
  "nilai": 90
}
```

#### Get Nilai by Kelas (Pengajar/Admin)

```http
GET /nilai/kelas/:kelasId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "kelas": {
    "namaKelas": "Tahsin - Kelas Pagi",
    "semester": { "nama": "Ganjil 2025/2026" },
    "mataPelajaran": { "nama": "Tahsin" }
  },
  "komponenList": [
    { "id": "uuid", "nama": "UTS", "bobot": 30 },
    { "id": "uuid", "nama": "UAS", "bobot": 40 }
  ],
  "pelajarList": [
    {
      "user": {
        "id": "uuid",
        "nama": "Muhammad Ali",
        "email": "ali@hcq.com"
      },
      "nilaiList": [
        { "komponenId": "uuid", "nilai": 85 },
        { "komponenId": "uuid", "nilai": 90 }
      ]
    }
  ]
}
```

#### Get My Nilai (Pelajar)

```http
GET /nilai/saya
Authorization: Bearer <pelajar-token>
```

**Response:**

```json
[
  {
    "kelas": {
      "id": "uuid",
      "namaKelas": "Tahsin - Kelas Pagi",
      "semester": { "nama": "Ganjil 2025/2026" },
      "mataPelajaran": { "nama": "Tahsin" }
    },
    "nilaiList": [
      {
        "id": "uuid",
        "nilai": 85,
        "komponen": {
          "id": "uuid",
          "nama": "UTS",
          "bobot": 30
        }
      },
      {
        "id": "uuid",
        "nilai": 90,
        "komponen": {
          "id": "uuid",
          "nama": "UAS",
          "bobot": 40
        }
      }
    ]
  }
]
```

---

### Materi & File Upload

#### Create Materi Section (Pengajar)

```http
POST /materi/section
Authorization: Bearer <pengajar-token>
Content-Type: application/json

{
  "kelasId": "uuid",
  "judul": "Bab 1: Makhorijul Huruf",
  "deskripsi": "Pembelajaran huruf hijaiyah dan makhraj"
}
```

**Response:**

```json
{
  "id": "uuid",
  "kelasId": "uuid",
  "judul": "Bab 1: Makhorijul Huruf",
  "deskripsi": "Pembelajaran huruf hijaiyah dan makhraj",
  "urutan": 0,
  "createdBy": "pengajar-uuid",
  "createdAt": "2025-11-06T...",
  "kelas": {
    "namaKelas": "Tahsin - Kelas Pagi"
  }
}
```

#### Get Sections by Kelas

```http
GET /materi/section/kelas/:kelasId
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "judul": "Bab 1: Makhorijul Huruf",
    "deskripsi": "...",
    "urutan": 0,
    "files": [
      {
        "id": "uuid",
        "judul": "Makhorijul Huruf.pdf",
        "filename": "Makhorijul Huruf.pdf",
        "filepath": "file-1699274523123.pdf",
        "mimetype": "application/pdf",
        "size": 2048576,
        "createdAt": "2025-11-06T..."
      }
    ]
  }
]
```

#### Upload File (Pengajar)

```http
POST /materi/file
Authorization: Bearer <pengajar-token>
Content-Type: multipart/form-data

materiSectionId: uuid
file: <binary-file>
```

**Supported File Types:**

- 📄 Documents: PDF, DOC, DOCX, TXT
- 📊 Presentations: PPT, PPTX
- 🖼️ Images: JPEG, PNG, GIF
- 🎥 Videos: MP4, MPEG

**File Size Limit:** 50MB

**Response:**

```json
{
  "id": "uuid",
  "sectionId": "uuid",
  "judul": "Makhorijul Huruf.pdf",
  "filename": "Makhorijul Huruf.pdf",
  "filepath": "file-1699274523123.pdf",
  "mimetype": "application/pdf",
  "size": 2048576,
  "createdAt": "2025-11-06T...",
  "section": {
    "judul": "Bab 1: Makhorijul Huruf",
    "kelas": {
      "namaKelas": "Tahsin - Kelas Pagi"
    }
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/materi/file \
  -H "Authorization: Bearer PENGAJAR_TOKEN" \
  -F "materiSectionId=SECTION_UUID" \
  -F "file=@/path/to/file.pdf"
```

#### Download File

```http
GET /materi/file/download/:id
Authorization: Bearer <token>
```

**Response:** Binary file stream with headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Makhorijul Huruf.pdf"
Content-Length: 2048576
```

**JavaScript Example:**

```javascript
fetch('http://localhost:3000/materi/file/download/file-uuid', {
  headers: { Authorization: 'Bearer YOUR_TOKEN' },
})
  .then((res) => res.blob())
  .then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Makhorijul Huruf.pdf';
    a.click();
  });
```

#### Delete File (Pengajar)

```http
DELETE /materi/file/:id
Authorization: Bearer <pengajar-token>
```

**Notes:**

- ⚠️ Deletes file from database and disk storage
- ⚠️ Deleting a section deletes all its files

---

### Announcement

#### Create Announcement

```http
POST /announcement
Authorization: Bearer <admin-or-pengajar-token>
Content-Type: application/json

# GLOBAL announcement (Admin only)
{
  "judul": "Libur Semester",
  "isi": "Semester akan libur mulai tanggal 20 Desember",
  "scope": "GLOBAL"
}

# KELAS announcement (Pengajar)
{
  "judul": "Tugas Hafalan",
  "isi": "Harap menghafalkan Surah Al-Mulk",
  "scope": "KELAS",
  "kelasId": "uuid"
}
```

**Scope Options:** `GLOBAL`, `KELAS`

**Response:**

```json
{
  "id": "uuid",
  "judul": "Libur Semester",
  "isi": "Semester akan libur mulai tanggal 20 Desember",
  "scope": "GLOBAL",
  "createdBy": "admin-uuid",
  "createdAt": "2025-11-06T10:00:00.000Z"
}
```

#### Get All Announcements (Filtered by Role & Enrollment)

```http
GET /announcement
Authorization: Bearer <token>
```

**Filtering Rules:**

- **ADMIN:** See all announcements
- **PENGAJAR:** See GLOBAL + KELAS where assigned
- **PELAJAR:** See GLOBAL + KELAS where enrolled

**Response:**

```json
[
  {
    "id": "uuid",
    "judul": "Libur Semester",
    "isi": "Semester akan libur mulai tanggal 20 Desember",
    "scope": "GLOBAL",
    "creator": {
      "nama": "Admin HCQ",
      "role": "ADMIN"
    },
    "createdAt": "2025-11-06T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "judul": "Tugas Hafalan",
    "isi": "Harap menghafalkan Surah Al-Mulk",
    "scope": "KELAS",
    "kelas": {
      "namaKelas": "Tahsin - Kelas Pagi"
    },
    "creator": {
      "nama": "Ustadz Ahmad",
      "role": "PENGAJAR"
    },
    "createdAt": "2025-11-06T09:00:00.000Z"
  }
]
```

#### Update Announcement

```http
PATCH /announcement/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "judul": "Updated Title",
  "isi": "Updated content"
}
```

**Authorization:** Only creator or ADMIN can update

#### Delete Announcement

```http
DELETE /announcement/:id
Authorization: Bearer <token>
```

**Authorization:** Only creator or ADMIN can delete

---

### SPP

#### Create Tagihan SPP (Admin)

```http
POST /spp
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "pelajar-uuid",
  "nominal": 500000,
  "bulan": "November",
  "tahun": 2025,
  "status": "BELUM_LUNAS"
}
```

**Status Options:** `LUNAS`, `BELUM_LUNAS`

#### Get All Tagihan SPP (Admin)

```http
GET /spp
Authorization: Bearer <admin-token>
```

#### Get Tagihan by Pelajar (Admin)

```http
GET /spp/pelajar/:pelajarId
Authorization: Bearer <admin-token>
```

#### Get My Tagihan SPP (Pelajar)

```http
GET /spp/saya
Authorization: Bearer <pelajar-token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "nominal": 500000,
    "bulan": "November",
    "tahun": 2025,
    "status": "BELUM_LUNAS",
    "createdAt": "2025-11-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "nominal": 500000,
    "bulan": "Oktober",
    "tahun": 2025,
    "status": "LUNAS",
    "createdAt": "2025-10-01T00:00:00.000Z"
  }
]
```

#### Update Tagihan SPP (Admin)

```http
PATCH /spp/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "LUNAS"
}
```

#### Delete Tagihan SPP (Admin)

```http
DELETE /spp/:id
Authorization: Bearer <admin-token>
```

---

### Gaji

#### Create Gaji (Admin)

```http
POST /gaji
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "pengajar-uuid",
  "nominal": 3000000,
  "bulan": "November",
  "tahun": 2025,
  "status": "BELUM_LUNAS"
}
```

#### Get All Gaji (Admin)

```http
GET /gaji
Authorization: Bearer <admin-token>
```

#### Get Gaji by Pengajar (Admin)

```http
GET /gaji/pengajar/:pengajarId
Authorization: Bearer <admin-token>
```

#### Get My Gaji (Pengajar)

```http
GET /gaji/saya
Authorization: Bearer <pengajar-token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "nominal": 3000000,
    "bulan": "November",
    "tahun": 2025,
    "status": "BELUM_LUNAS",
    "createdAt": "2025-11-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "nominal": 3000000,
    "bulan": "Oktober",
    "tahun": 2025,
    "status": "LUNAS",
    "createdAt": "2025-10-01T00:00:00.000Z"
  }
]
```

#### Update Gaji (Admin)

```http
PATCH /gaji/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "LUNAS",
  "nominal": 3500000
}
```

#### Delete Gaji (Admin)

```http
DELETE /gaji/:id
Authorization: Bearer <admin-token>
```

---

## 🚀 tRPC API

### Overview

tRPC provides end-to-end type safety between backend and frontend without code generation.

**Base URL:** `http://localhost:3000/trpc`

### Available Routers

#### 1. Auth Router

**Login:**

```typescript
const { access_token, user } = await trpc.auth.login.mutate({
  email: 'admin@hcq.com',
  password: 'admin123',
});
```

**Register:**

```typescript
const user = await trpc.auth.register.mutate({
  email: 'newuser@hcq.com',
  password: 'password123',
  nama: 'Ahmad Rizki',
  role: 'PELAJAR',
});
```

**Get Current User:**

```typescript
const user = await trpc.auth.me.query();
```

#### 2. Kelas Router

**Get All Kelas:**

```typescript
const kelasList = await trpc.kelas.getAll.query();
```

**Get Kelas by ID:**

```typescript
const kelas = await trpc.kelas.getById.query({ id: 'uuid' });
```

**Create Kelas (Admin):**

```typescript
const newKelas = await trpc.kelas.create.mutate({
  namaKelas: 'Tahsin - Kelas Sore',
  jadwalHari: 'Selasa',
  jadwalJam: '16:00',
  semesterId: 'uuid',
  mataPelajaranId: 'uuid',
});
```

**Enroll Pelajar (Admin):**

```typescript
await trpc.kelas.enrollPelajar.mutate({
  kelasId: 'uuid',
  userId: 'uuid',
});
```

**Get My Kelas:**

```typescript
const myKelas = await trpc.kelas.getMyKelas.query();
```

#### 3. Nilai Router

**Create Komponen Nilai (Pengajar):**

```typescript
const komponen = await trpc.nilai.createKomponen.mutate({
  kelasId: 'uuid',
  nama: 'UTS',
  bobot: 30,
});
```

**Entry Nilai (Pengajar):**

```typescript
const nilai = await trpc.nilai.entryNilai.mutate({
  komponenId: 'uuid',
  pelajarId: 'uuid',
  nilai: 85.5,
});
```

**Get My Nilai (Pelajar):**

```typescript
const myNilai = await trpc.nilai.getMyNilai.query();
```

**Get Nilai by Kelas (Pengajar):**

```typescript
const kelasNilai = await trpc.nilai.getNilaiByKelas.query({
  kelasId: 'uuid',
});
```

### Frontend Integration (React/Next.js)

**1. Install Dependencies:**

```bash
npm install @trpc/client @trpc/react-query @tanstack/react-query
```

**2. Create tRPC Client:**

```typescript
// lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../backend/src/trpc/trpc.router';

export const trpc = createTRPCReact<AppRouter>();
```

**3. Setup Provider:**

```typescript
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc';

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
          headers() {
            return {
              authorization: `Bearer ${localStorage.getItem('token')}`,
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

**4. Use in Components:**

```typescript
// components/KelasList.tsx
import { trpc } from '@/lib/trpc';

export function KelasList() {
  const { data, isLoading } = trpc.kelas.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(kelas => (
        <div key={kelas.id}>
          <h3>{kelas.namaKelas}</h3>
          <p>{kelas.mataPelajaran.nama}</p>
        </div>
      ))}
    </div>
  );
}
```

**5. Mutations:**

```typescript
// components/CreateKelas.tsx
import { trpc } from '@/lib/trpc';

export function CreateKelas() {
  const utils = trpc.useContext();
  const createKelas = trpc.kelas.create.useMutation({
    onSuccess: () => {
      utils.kelas.getAll.invalidate();
    },
  });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      createKelas.mutate({ /* form data */ });
    }}>
      {/* form fields */}
    </form>
  );
}
```

### tRPC Benefits

✅ **Full Type Safety** - TypeScript knows exact return types  
✅ **Auto-completion** - IDE suggestions for all routes  
✅ **Refactoring Safety** - Frontend errors show immediately  
✅ **No Code Generation** - Types shared directly from backend

---

## 🔒 Authorization Matrix

| Module               | Create           | Read             | Update        | Delete        |
| -------------------- | ---------------- | ---------------- | ------------- | ------------- |
| **User**             | ADMIN            | ADMIN            | ADMIN         | ADMIN         |
| **Semester**         | ADMIN            | ALL              | ADMIN         | ADMIN         |
| **Mata Pelajaran**   | ADMIN            | ALL              | ADMIN         | ADMIN         |
| **Kelas**            | ADMIN            | ALL              | ADMIN         | ADMIN         |
| **Enrollment**       | ADMIN            | ALL              | -             | ADMIN         |
| **Presensi Session** | PENGAJAR         | PENGAJAR/PELAJAR | -             | -             |
| **Presensi Record**  | PELAJAR/PENGAJAR | PENGAJAR/PELAJAR | PENGAJAR      | -             |
| **Komponen Nilai**   | PENGAJAR         | ALL              | PENGAJAR      | PENGAJAR      |
| **Nilai Entry**      | PENGAJAR         | PENGAJAR/PELAJAR | PENGAJAR      | PENGAJAR      |
| **Materi Section**   | PENGAJAR         | ALL              | PENGAJAR      | PENGAJAR      |
| **Materi File**      | PENGAJAR         | ALL              | -             | PENGAJAR      |
| **Announcement**     | ADMIN/PENGAJAR   | ALL              | Creator/ADMIN | Creator/ADMIN |
| **SPP**              | ADMIN            | ADMIN/PELAJAR    | ADMIN         | ADMIN         |
| **Gaji**             | ADMIN            | ADMIN/PENGAJAR   | ADMIN         | ADMIN         |

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code    | Meaning      | Example                         |
| ------- | ------------ | ------------------------------- |
| **200** | OK           | Successful GET/PATCH/DELETE     |
| **201** | Created      | Successful POST                 |
| **400** | Bad Request  | Validation error, expired code  |
| **401** | Unauthorized | Invalid/missing JWT token       |
| **403** | Forbidden    | Insufficient role permissions   |
| **404** | Not Found    | Resource doesn't exist          |
| **409** | Conflict     | Duplicate entry, already exists |
| **500** | Server Error | Unexpected error                |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Errors

**Validation Error:**

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be at least 6 characters"
  ],
  "error": "Bad Request"
}
```

**Unauthorized:**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**Forbidden:**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**Not Found:**

```json
{
  "statusCode": 404,
  "message": "Kelas with ID ... not found"
}
```

**Conflict:**

```json
{
  "statusCode": 409,
  "message": "Email already registered"
}
```

---

## 📊 Complete Workflow Examples

### Scenario 1: Admin Creates Kelas & Enrolls Students

```bash
# 1. Login as Admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hcq.com","password":"admin123"}'

# 2. Create Kelas
curl -X POST http://localhost:3000/kelas \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "namaKelas": "Tahsin - Kelas Pagi",
    "jadwalHari": "Senin",
    "jadwalJam": "08:00",
    "semesterId": "SEMESTER_UUID",
    "mataPelajaranId": "MAPEL_UUID"
  }'

# 3. Assign Pengajar
curl -X POST http://localhost:3000/kelas/KELAS_UUID/assign-pengajar \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pengajarId":"PENGAJAR_UUID"}'

# 4. Enroll Pelajar
curl -X POST http://localhost:3000/kelas/KELAS_UUID/enroll-pelajar \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pelajarId":"PELAJAR_UUID"}'
```

### Scenario 2: Pengajar Manages Presensi

```bash
# 1. Start Kelas & Generate Code
curl -X POST http://localhost:3000/presensi/kelas/KELAS_UUID/mulai \
  -H "Authorization: Bearer PENGAJAR_TOKEN"

# Response: { "kode": "ABC123", "expiresAt": "..." }

# 2. Pelajar Submits Presensi
curl -X POST http://localhost:3000/presensi/hadir \
  -H "Authorization: Bearer PELAJAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"kodePresensi":"ABC123"}'

# 3. Pengajar Views Presensi
curl http://localhost:3000/presensi/session/SESSION_UUID \
  -H "Authorization: Bearer PENGAJAR_TOKEN"
```

### Scenario 3: Pengajar Uploads Materi

```bash
# 1. Create Section
curl -X POST http://localhost:3000/materi/section \
  -H "Authorization: Bearer PENGAJAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kelasId": "KELAS_UUID",
    "judul": "Bab 1: Makhorijul Huruf",
    "deskripsi": "Pembelajaran huruf hijaiyah"
  }'

# 2. Upload File
curl -X POST http://localhost:3000/materi/file \
  -H "Authorization: Bearer PENGAJAR_TOKEN" \
  -F "materiSectionId=SECTION_UUID" \
  -F "file=@makhorijul-huruf.pdf"

# 3. Pelajar Views Materi
curl http://localhost:3000/materi/section/kelas/KELAS_UUID \
  -H "Authorization: Bearer PELAJAR_TOKEN"

# 4. Pelajar Downloads File
curl http://localhost:3000/materi/file/download/FILE_UUID \
  -H "Authorization: Bearer PELAJAR_TOKEN" \
  -o downloaded.pdf
```

### Scenario 4: Pengajar Manages Nilai

```bash
# 1. Create Komponen
curl -X POST http://localhost:3000/nilai/komponen \
  -H "Authorization: Bearer PENGAJAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"kelasId":"KELAS_UUID","nama":"UTS","bobot":30}'

# 2. Entry Nilai
curl -X POST http://localhost:3000/nilai/entry \
  -H "Authorization: Bearer PENGAJAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"komponenId":"KOMPONEN_UUID","pelajarId":"PELAJAR_UUID","nilai":85}'

# 3. Pelajar Views Nilai
curl http://localhost:3000/nilai/saya \
  -H "Authorization: Bearer PELAJAR_TOKEN"
```

---

## 🎯 Testing Checklist

### Authentication

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user (Admin)
- [ ] Access protected endpoint without token
- [ ] Access protected endpoint with expired token

### Authorization

- [ ] Admin can access admin-only endpoints
- [ ] Pengajar can access pengajar endpoints
- [ ] Pelajar cannot access admin endpoints
- [ ] User can only access their own data

### Kelas Management

- [ ] Admin creates kelas
- [ ] Admin enrolls pelajar
- [ ] Admin assigns pengajar
- [ ] All users can view kelas list
- [ ] User can view enrolled kelas only

### Presensi

- [ ] Pengajar starts kelas and gets code
- [ ] Pelajar submits presensi with valid code
- [ ] Pelajar cannot submit with expired code
- [ ] Pelajar cannot submit twice
- [ ] Pengajar can do manual presensi

### Nilai

- [ ] Pengajar creates komponen nilai
- [ ] Pengajar entries nilai for pelajar
- [ ] Pelajar views own nilai
- [ ] Nilai updates correctly (upsert)

### Materi

- [ ] Pengajar creates section
- [ ] Pengajar uploads file (valid type)
- [ ] Upload fails with invalid file type
- [ ] Upload fails with file > 50MB
- [ ] Pelajar downloads file
- [ ] Deleting section deletes files

### Announcement

- [ ] Admin creates GLOBAL announcement
- [ ] Pengajar creates KELAS announcement
- [ ] Pelajar sees filtered announcements
- [ ] Only creator/admin can update
- [ ] Only creator/admin can delete

### SPP & Gaji

- [ ] Admin creates tagihan
- [ ] Admin updates status to LUNAS
- [ ] Pelajar views own SPP
- [ ] Pengajar views own Gaji
- [ ] Pelajar cannot view others' SPP

---

## 📚 Additional Resources

- **Prisma Schema:** `prisma/schema.prisma`
- **Seed Data:** `prisma/seed.ts`
- **Environment:** `.env.example`
- **tRPC Documentation:** [trpc.io](https://trpc.io)
- **NestJS Documentation:** [docs.nestjs.com](https://docs.nestjs.com)

---

## 🔧 Development Commands

```bash
# Start development server
pnpm run start:dev

# Build for production
pnpm run build

# Run production build
pnpm run start:prod

# Run database migrations
pnpm prisma:migrate

# Seed database
pnpm prisma:seed

# Reset database
pnpm prisma:reset

# Generate Prisma client
pnpm prisma:generate

# Run tests
pnpm run test

# Lint code
pnpm run lint
```

---

**Documentation Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**API Status:** ✅ Production Ready  
**Build Status:** ✅ Passing  
**Test Coverage:** Coming Soon

---

**Need Help?**

- Check error messages carefully
- Verify JWT token is valid and not expired
- Ensure user has correct role for endpoint
- Check network request/response in browser DevTools
- Review Prisma schema for data structure

**Contact:** HCQ LMS Development Team
