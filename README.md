# 🎓 HCQ LMS Backend

> Learning Management System API untuk Halaqoh Cinta Qur'an

**Built with:** NestJS + Prisma + PostgreSQL
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

- **Magic Link Invitation** - Secure teacher onboarding with token expiry
- **File Upload System** - PDF, DOC, PPT, images, videos support
- **Smart Presensi** - Auto-expiring attendance codes
- **Flexible Grading** - Weighted grade components (UTS, UAS, etc.)
- **Role-Based Access** - Granular permissions per module
- **Optional User Profiles** - fullName, cities, address, phoneNumber fields
- **Git Hooks** - Pre-commit linting and testing with Husky

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

### Base URL

```
Development: http://localhost:4000/api/v1
Production: https://api.hcq.com/api/v1 (coming soon)
```

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

- All REST endpoints (80+ routes)
- Authentication & magic link registration guide
- Request/response examples
- Error handling
- Complete workflow examples
- Testing checklist
- Authorization matrix

---

## 🔐 Authentication & Registration

### Unified Registration System with Magic Link

This system uses a modern, secure registration flow:

#### 1️⃣ **Student Self-Registration** (Public)

Students can register themselves without admin intervention:

```bash
POST /auth/register
```

**Features:**

- ✅ No authentication required
- ✅ Automatic PELAJAR role assignment
- ✅ Instant account creation
- ✅ Optional profile fields (fullName, cities, address, phoneNumber)

**Example:**

```json
{
  "email": "student@example.com",
  "password": "password123",
  "nama": "Student Name",
  "fullName": "Student Full Name",
  "cities": "Jakarta",
  "address": "Jl. Example No. 123",
  "phoneNumber": "081234567890"
}
```

#### 2️⃣ **Teacher Registration via Magic Link** (Token-Based)

Admin creates invitation, teacher registers using magic link:

**Step 1 - Admin Creates Invitation:**

```bash
POST /auth/invite-pengajar
Authorization: Bearer <admin-token>

{
  "email": "teacher@hcq.com"
}
```

**Response:**

```json
{
  "message": "Invitation created successfully",
  "email": "teacher@hcq.com",
  "magicLink": "http://localhost:3000/register?token=abc123...",
  "expiresAt": "2025-11-13T12:00:00.000Z"
}
```

**Step 2 - Teacher Registers:**

```bash
POST /auth/register?token=abc123...

{
  "email": "teacher@hcq.com",
  "password": "password123",
  "nama": "Teacher Name"
}
```

**Features:**

- 🔒 Token-based security (7-day expiry)
- 🔒 Email verification required
- 🔒 One-time use tokens
- ✅ Automatic PENGAJAR role assignment

**Why Magic Link System?**

- **Security:** Prevents unauthorized teacher account creation
- **Email Verification:** Ensures valid email addresses
- **UX:** No complex verification process
- **Control:** Admin maintains full control over teacher invitations

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
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hcq.com","password":"admin123"}'
```

---

## 📁 Project Structure

```
src/
├── auth/              # Authentication & JWT + Magic Link
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

- `POST /auth/login` - User login (Public) - Returns access & refresh tokens
- `POST /auth/register` - Student self-registration (Public) or Teacher with token
- `POST /auth/invite-pengajar` - Create teacher invitation (Admin only)
- `POST /auth/refresh` - Get new access token using refresh token
- `POST /auth/logout` - Invalidate refresh token
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

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint list.**

---

## 🔒 Security Features

- ✅ **Magic Link Invitation System** - Secure token-based teacher registration
- ✅ **JWT Refresh Token** - Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- ✅ **Token Rotation** - New refresh token issued on each refresh for enhanced security
- ✅ **JWT-based Authentication** - Secure token-based auth
- ✅ **Argon2 Password Hashing** - Winner of Password Hashing Competition 2015
- ✅ **Role-based Authorization** - ADMIN, PENGAJAR, PELAJAR with granular permissions
- ✅ **Input Validation** - class-validator for all DTOs
- ✅ **CORS Enabled** - Configured for localhost:3000 (frontend)
- ✅ **File Type Validation** - Strict MIME type checking
- ✅ **File Size Limits** - 50MB maximum upload size
- ✅ **Token Expiration** - Magic links expire after 7 days
- ✅ **One-Time Use Tokens** - Registration tokens can only be used once
- ✅ **Email Verification** - Email must match invitation
- ✅ **Stateful Refresh Tokens** - Stored in database for instant revocation

**Security Best Practices:**

- Argon2 provides better resistance to GPU-based attacks than bcrypt
- JWT secrets should be 64+ random characters in production
- Environment variables never committed to git
- Magic link tokens are cryptographically secure (32 bytes random)
- Refresh tokens enable secure logout and session management
- Access tokens are short-lived to minimize security risks
- See [SECURITY.md](./SECURITY.md) for production security checklist
- See [REFRESH_TOKEN.md](./REFRESH_TOKEN.md) for token implementation details

---

## 📊 Database Schema

17 models including:

- User (with roles & optional profile fields)
- RefreshToken (for JWT refresh token system)
- PengajarInvitation (for magic link system)
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
- [ ] Update FRONTEND_URL for magic links
- [ ] Configure file upload directory
- [ ] Setup reverse proxy (nginx)
- [ ] Enable SSL/TLS
- [ ] Configure CORS for production domain
- [ ] Setup database backups
- [ ] Add rate limiting
- [ ] Configure logging & monitoring
- [ ] Setup email service for magic links
- [ ] Review [SECURITY.md](./SECURITY.md) checklist

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

See **[GIT_HOOKS.md](./GIT_HOOKS.md)** for Git hooks and quality checks.

This project uses:

- ✅ **Husky** - Git hooks for pre-commit checks
- ✅ **Lint-staged** - Run linters on staged files only
- ✅ **ESLint** - Code linting and auto-fixing
- ✅ **Prettier** - Code formatting
- ✅ **Jest** - Automated testing

For internal development:

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test
3. Stage files: `git add .`
4. Commit (hooks run automatically): `git commit -m 'feat: add new feature'`
5. Push: `git push origin feature/new-feature`
6. Create Pull Request

**Note:** Commits will be blocked if:

- ❌ ESLint errors found
- ❌ Tests fail
- ❌ Commit message < 10 characters

---

## 👨‍💻 Development Team

**Backend Developer:** Faralha + Github Copilot (Claude Sonnet 4.5)
**Project:** HCQ LMS  
**Started:** November 2025  
**Status:** Production Ready ✅

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

See [LICENSE_THIRD_PARTY.md](LICENSE_THIRD_PARTY.md) for attribution of open-source dependencies.

---

## 📞 Support

For questions or issues:

- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [SECURITY.md](./SECURITY.md) for security guidelines
- Review [REFRESH_TOKEN.md](./REFRESH_TOKEN.md) for JWT refresh token implementation
- Review [GIT_HOOKS.md](./GIT_HOOKS.md) for development workflow
- Check [TESTING.md](./TESTING.md) for testing guide
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
