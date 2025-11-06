# 🎓 HCQ LMS Backend

> Learning Management System API untuk Halaqoh Cinta Qur'an

**Built with:** NestJS + Prisma + PostgreSQL + tRPC  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## 📋 Features

### ✅ Core Modules (100% Complete)

- 🔐 **Authentication & Authorization** - JWT + Role-based access control
- 👥 **User Management** - Full CRUD for ADMIN, PENGAJAR, PELAJAR
- 📅 **Semester Management** - Academic period management
- 📚 **Mata Pelajaran** - Subject/course management
- 🏫 **Kelas & Enrollment** - Class management with student/teacher assignment
- ✋ **Presensi System** - Attendance with 6-digit code + 3-hour expiry
- 📊 **Nilai Management** - Grades with komponen & bobot system
- 📁 **Materi & File Upload** - Learning materials with Multer (50MB limit)
- 📢 **Announcement** - Global & class-specific announcements
- 💰 **SPP Management** - Student payment tracking
- 💵 **Gaji Management** - Teacher salary tracking

### 🚀 Advanced Features

- **tRPC Integration** - Type-safe API alongside REST endpoints
- **File Upload System** - PDF, DOC, PPT, images, videos support
- **Smart Presensi** - Auto-expiring attendance codes
- **Flexible Grading** - Weighted grade components (UTS, UAS, etc.)
- **Role-Based Access** - Granular permissions per module

---

## 🛠️ Tech Stack

- **Framework:** NestJS 10.x
- **Language:** TypeScript 5.x
- **ORM:** Prisma 6.x
- **Database:** PostgreSQL 18
- **Authentication:** Passport + JWT
- **Validation:** class-validator + class-transformer
- **File Upload:** Multer
- **Type-Safe API:** tRPC 11.x + Zod
- **Package Manager:** pnpm

---

## 📖 Description

Complete backend API for Islamic learning management system with comprehensive features for managing students, teachers, classes, attendance, grades, and learning materials.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

```bash
# Run migrations
pnpm prisma:migrate

# Seed test data
pnpm prisma:seed

# Open Prisma Studio (optional)
pnpm prisma:studio
```

### Running the App

```bash
# Development mode (watch)
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod
```

The API will be available at:

- REST API: `http://localhost:3000`
- tRPC API: `http://localhost:3000/trpc`

---

## 🧪 Testing

This project includes comprehensive test coverage:

- **Unit Tests**: Testing individual services and components
- **Integration Tests**: Testing module interactions
- **E2E Tests**: Testing complete API workflows

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

### Current Test Coverage

- ✅ **Auth Module** - Registration, Login, JWT validation
- ✅ **User Module** - CRUD operations, validation
- ✅ **Semester Module** - Full CRUD with status management
- 📝 More modules in progress...

See **[TESTING.md](./TESTING.md)** for complete testing guide.

---

## 📚 API Documentation

See **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** for complete API reference including:

- All REST endpoints (70+ routes)
- tRPC usage & examples
- Authentication guide
- Request/response examples
- Error handling
- Testing guide
- Frontend integration

---

## 🔐 Authentication & Registration

### Dual Registration System

This system has two separate registration flows for better security:

#### 1️⃣ **Student Self-Registration** (Public)

Students can register themselves without admin intervention:

```bash
POST /auth/register/pelajar
```

**Features:**
- ✅ No authentication required
- ✅ Automatic PELAJAR role assignment
- ✅ Instant account creation
- ✅ Ready to enroll in classes

**Example:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "nama": "Student Name"
}
```

#### 2️⃣ **Staff Registration** (Admin Only)

Admins create PENGAJAR and ADMIN accounts:

```bash
POST /auth/register
Authorization: Bearer <admin-token>
```

**Features:**
- 🔒 Admin authentication required
- 🔒 Can only create PENGAJAR or ADMIN roles
- 🚫 PELAJAR registration through this endpoint is forbidden
- ✅ Full control over staff accounts

**Why Two Endpoints?**
- **Security:** Prevents unauthorized privilege escalation
- **UX:** Students don't need to contact admin for registration
- **Control:** Admin maintains full control over staff accounts

### Default Test Accounts

After running `pnpm prisma:seed`:

| Role         | Email            | Password    | Access Level                  |
| ------------ | ---------------- | ----------- | ----------------------------- |
| **ADMIN**    | admin@hcq.com    | admin123    | Full system access            |
| **PENGAJAR** | pengajar@hcq.com | pengajar123 | Manage kelas, presensi, nilai |
| **PELAJAR**  | pelajar@hcq.com  | pelajar123  | View kelas, submit presensi   |

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Manual API testing
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hcq.com","password":"admin123"}'
```

---

## 📁 Project Structure

```
src/
├── auth/              # Authentication & JWT
├── user/              # User management
├── semester/          # Semester management
├── mata-pelajaran/    # Subject management
├── kelas/             # Class & enrollment
├── presensi/          # Attendance system
├── nilai/             # Grade management
├── materi/            # Learning materials & files
├── announcement/      # Announcements
├── spp/               # Student payments
├── gaji/              # Teacher salaries
├── trpc/              # tRPC routers
│   ├── routers/
│   │   ├── auth.router.ts
│   │   ├── kelas.router.ts
│   │   └── nilai.router.ts
│   ├── trpc.service.ts
│   └── trpc.router.ts
├── prisma/            # Prisma client
├── app.module.ts      # Root module
└── main.ts            # Application entry
```

---

## 🔧 Development

### Prisma Commands

```bash
# Generate Prisma client
pnpm prisma:generate

# Create migration
pnpm prisma migrate dev --name migration-name

# Reset database (WARNING: deletes all data)
pnpm prisma:reset

# Seed database
pnpm prisma:seed
```

### Build & Lint

```bash
# Build for production
pnpm run build

# Lint code
pnpm run lint

# Format code
pnpm run format
```

---

## 🌐 API Endpoints Overview

### Authentication

- `POST /auth/login` - User login (Public)
- `POST /auth/register/pelajar` - Student self-registration (Public)
- `POST /auth/register` - Register staff (Admin only)
- `GET /auth/me` - Get current user info
- `PATCH /auth/change-password` - Change password (Authenticated users)

### User Management (Admin)

- `GET /users` - List all users
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Kelas & Enrollment

- `GET /kelas` - List all classes
- `POST /kelas` - Create class (Admin)
- `POST /kelas/:id/enroll-pelajar` - Enroll student (Admin)
- `POST /kelas/:id/assign-pengajar` - Assign teacher (Admin)

### Presensi

- `POST /presensi/kelas/:id/mulai` - Start class & generate code (Pengajar)
- `POST /presensi/hadir` - Submit attendance (Pelajar)
- `GET /presensi/riwayat` - View attendance history (Pelajar)

### Nilai

- `POST /nilai/komponen` - Create grade component (Pengajar)
- `POST /nilai/entry` - Enter grade (Pengajar)
- `GET /nilai/saya` - View my grades (Pelajar)

### Materi

- `POST /materi/section` - Create section (Pengajar)
- `POST /materi/file` - Upload file (Pengajar)
- `GET /materi/file/download/:id` - Download file

### tRPC

- `trpc.auth.login` - Type-safe login
- `trpc.kelas.getAll` - Get all classes
- `trpc.nilai.getMyNilai` - Get my grades

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint list.**

---

## 🔒 Security Features

- ✅ **Dual Registration System** - Public for students, admin-only for staff
- ✅ **JWT-based Authentication** - Secure token-based auth
- ✅ **Argon2 Password Hashing** - Winner of Password Hashing Competition 2015
- ✅ **Role-based Authorization** - ADMIN, PENGAJAR, PELAJAR with granular permissions
- ✅ **Input Validation** - class-validator for all DTOs
- ✅ **CORS Enabled** - Configurable cross-origin requests
- ✅ **File Type Validation** - Strict MIME type checking
- ✅ **File Size Limits** - 50MB maximum upload size
- ✅ **Privilege Escalation Prevention** - ForbiddenException for invalid role creation

**Security Best Practices:**
- Argon2 provides better resistance to GPU-based attacks than bcrypt
- JWT secrets should be 64+ random characters in production
- Environment variables never committed to git
- See [SECURITY.md](./SECURITY.md) for production security checklist

---

## 📊 Database Schema

15 models including:

- User (with roles)
- Semester, MataPelajaran, Kelas
- Enrollment
- PresensiSession, PresensiRecord
- KomponenNilai, Nilai
- MateriSection, MateriFile
- Announcement
- TagihanSPP, Gaji

See `prisma/schema.prisma` for complete schema.

---

## 🚀 Deployment

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hcq_lms"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### Production Checklist

- [ ] Set production DATABASE_URL
- [ ] Set strong JWT_SECRET (random 64+ chars)
- [ ] Configure file upload directory
- [ ] Setup reverse proxy (nginx)
- [ ] Enable SSL/TLS
- [ ] Configure CORS for production domain
- [ ] Setup database backups
- [ ] Add rate limiting
- [ ] Configure logging
- [ ] Setup monitoring

---

## 📝 Scripts Reference

## 📝 Scripts Reference

```bash
# Install dependencies
pnpm install

# Development
pnpm run start          # Start
pnpm run start:dev      # Start with watch mode
pnpm run start:debug    # Start with debug mode

# Build & Production
pnpm run build          # Build for production
pnpm run start:prod     # Run production build

# Testing
pnpm run test           # Run all unit tests
pnpm run test:watch     # Unit tests in watch mode
pnpm run test:cov       # Test coverage report
pnpm run test:e2e       # E2E integration tests
pnpm run test:debug     # Debug tests

# Code Quality
pnpm run lint           # Lint code
pnpm run format         # Format code with Prettier

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run migrations
pnpm prisma:seed        # Seed database
pnpm prisma:studio      # Open Prisma Studio
pnpm prisma:reset       # Reset database (⚠️ deletes data)
```

---

## 🤝 Contributing

This is a private project for Halaqoh Cinta Qur'an. For internal development:

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test
3. Commit: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Create Pull Request

---

## 👨‍💻 Development Team

**Backend Developer:** Faralha + Github Copilot (Claude Sonnet 4.5)
**Project:** HCQ LMS  
**Started:** November 2025  
**Status:** Production Ready ✅

---

## 📞 Support

For questions or issues:

- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [PROGRESS.md](./PROGRESS.md) for feature status
- Check error logs in terminal
- Verify database connection
- Ensure JWT_SECRET is set

---

## 🎯 Next Steps

### For Backend:

- ✅ All core features complete
- [ ] Setup monitoring (optional)
- [ ] Add email notifications (optional)
- [ ] Implement analytics (optional)

### For Frontend:

- [ ] Build Next.js frontend
- [ ] Integrate tRPC client
- [ ] Create UI components
- [ ] Implement authentication flow
- [ ] Add file upload UI
- [ ] Create dashboard

### For DevOps:

- [ ] Setup CI/CD pipeline
- [ ] Configure production server
- [ ] Setup database backups
- [ ] Add monitoring & alerts
- [ ] Configure SSL certificate

---

**Made with ❤️ for Halaqoh Cinta Qur'an**
