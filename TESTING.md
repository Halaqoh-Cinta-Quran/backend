# Testing Documentation

## 📋 Test Suite Overview

This backend application includes comprehensive testing coverage:

- **Unit Tests**: Testing individual services and components
- **Integration Tests**: Testing module interactions
- **E2E Tests**: Testing complete API workflows

## 🧪 Test Structure

```
hcq-backend/
├── src/
│   ├── auth/
│   │   └── auth.service.spec.ts        # Auth service unit tests
│   ├── user/
│   │   └── user.service.spec.ts        # User service unit tests
│   ├── semester/
│   │   └── semester.service.spec.ts    # Semester service unit tests
│   └── ...
├── test/
│   ├── auth.e2e-spec.ts                # Auth E2E tests
│   └── jest-e2e.json                   # E2E Jest config
└── package.json
```

## 🚀 Running Tests

### Run All Unit Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test:cov
```

### Run E2E Tests

```bash
pnpm test:e2e
```

### Run Specific Test File

```bash
pnpm test auth.service.spec.ts
```

### Run Tests in Debug Mode

```bash
pnpm test:debug
```

## 📊 Test Coverage

Current test coverage includes:

### ✅ Auth Module

- User registration
- User login
- JWT token generation
- Password hashing with Argon2
- Invalid credentials handling
- Duplicate email prevention

### ✅ User Module

- Create user
- Get all users
- Get user by ID
- Update user
- Delete user
- Email uniqueness validation

### ✅ Semester Module

- Create semester
- Get all semesters
- Get semester by ID
- Update semester
- Delete semester
- Not found handling

## 🎯 Test Examples

### Unit Test Example (Auth Service)

```typescript
describe('AuthService', () => {
  it('should successfully login with valid credentials', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await service.login(loginDto);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('user');
  });
});
```

### E2E Test Example (Auth Endpoints)

```typescript
describe('/auth/register (POST)', () => {
  it('should register a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        nama: 'Test User',
        role: 'PELAJAR',
      })
      .expect(201);
  });
});
```

## 🔧 Test Configuration

### Jest Configuration (Unit Tests)

Located in `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### Jest E2E Configuration

Located in `test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

## 📝 Writing New Tests

### 1. Unit Test Template

Create a file named `<module>.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { PrismaService } from '../prisma/prisma.service';

describe('YourService', () => {
  let service: YourService;

  const mockPrismaService = {
    // Mock your database methods here
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add your tests here
});
```

### 2. E2E Test Template

Create a file named `<module>.e2e-spec.ts` in the `test` directory:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Module E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });
});
```

## 🎯 Testing Best Practices

### 1. **AAA Pattern**: Arrange, Act, Assert

```typescript
it('should create a user', async () => {
  // Arrange
  const createUserDto = {
    email: 'test@example.com',
    password: 'password123',
    nama: 'Test User',
    role: 'PELAJAR',
  };

  // Act
  const result = await service.create(createUserDto);

  // Assert
  expect(result).toHaveProperty('email', createUserDto.email);
});
```

### 2. **Mock External Dependencies**

```typescript
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};
```

### 3. **Test Edge Cases**

```typescript
it('should throw NotFoundException if user not found', async () => {
  mockPrismaService.user.findUnique.mockResolvedValue(null);

  await expect(service.findOne('nonexistent-id')).rejects.toThrow(
    NotFoundException,
  );
});
```

### 4. **Clean Up After Tests**

```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await app.close();
});
```

## 🐛 Debugging Tests

### VSCode Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "--watchAll=false"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Using Console Logs

```typescript
it('should do something', () => {
  console.log('Debug info:', someValue);
  expect(someValue).toBe(expected);
});
```

## 📈 Coverage Goals

Target coverage metrics:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:

```bash
pnpm test:cov
# Open coverage/lcov-report/index.html in browser
```

## 🔍 Common Issues & Solutions

### Issue: Tests timeout

```typescript
// Increase timeout for slow tests
jest.setTimeout(30000);
```

### Issue: Database connection in tests

```typescript
// Use test database
beforeAll(async () => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});
```

### Issue: Mock not working

```typescript
// Ensure mock is cleared between tests
afterEach(() => {
  jest.clearAllMocks();
});
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## 🎓 Test Development Workflow

1. **Write failing test** (Red)
2. **Write minimal code to pass** (Green)
3. **Refactor code** (Refactor)
4. **Repeat**

This is the TDD (Test-Driven Development) approach.

---

**Last Updated:** November 2025  
**Test Coverage:** In Progress  
**Test Framework:** Jest + Supertest
