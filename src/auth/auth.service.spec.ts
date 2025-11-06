import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    pengajarInvitation: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register ADMIN user (deprecated - now uses invitation system)', async () => {
      // This test is kept for backward compatibility
      // In practice, ADMIN users should be created through seed or direct DB operations
      const registerDto = {
        email: 'admin@example.com',
        password: 'password123',
        nama: 'Admin User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        nama: registerDto.nama,
        role: Role.PELAJAR,
        createdAt: new Date(),
      });

      const result = await service.registerPelajar(registerDto);

      expect(result).toHaveProperty(
        'message',
        'Student registered successfully',
      );
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.role).toBe(Role.PELAJAR);
    });

    it('should successfully register PENGAJAR user with valid token', async () => {
      const token = 'valid-token-123';
      const registerDto = {
        email: 'pengajar@example.com',
        password: 'password123',
        nama: 'Pengajar User',
      };

      const mockInvitation = {
        id: 'inv-1',
        email: registerDto.email,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        used: false,
        createdAt: new Date(),
      };

      mockPrismaService.pengajarInvitation.findUnique.mockResolvedValue(
        mockInvitation,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        nama: registerDto.nama,
        role: Role.PENGAJAR,
        createdAt: new Date(),
      });
      mockPrismaService.pengajarInvitation.update.mockResolvedValue(
        mockInvitation,
      );

      const result = await service.registerPengajarWithToken(
        registerDto,
        token,
      );

      expect(result).toHaveProperty(
        'message',
        'Teacher registered successfully',
      );
      expect(result.user.role).toBe(Role.PENGAJAR);
    });

    it('should throw BadRequestException when token is invalid', async () => {
      const registerDto = {
        email: 'pelajar@example.com',
        password: 'password123',
        nama: 'Pelajar User',
      };

      mockPrismaService.pengajarInvitation.findUnique.mockResolvedValue(null);

      await expect(
        service.registerPengajarWithToken(registerDto, 'invalid-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        nama: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      await expect(service.registerPelajar(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('registerPelajar', () => {
    it('should successfully register a pelajar', async () => {
      const registerDto = {
        email: 'pelajar@example.com',
        password: 'password123',
        nama: 'Pelajar User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        nama: registerDto.nama,
        role: Role.PELAJAR,
        createdAt: new Date(),
      });

      const result = await service.registerPelajar(registerDto);

      expect(result).toHaveProperty(
        'message',
        'Student registered successfully',
      );
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.role).toBe(Role.PELAJAR);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        nama: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      await expect(service.registerPelajar(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await argon2.hash(loginDto.password);
      const mockUser = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
        nama: 'Test User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await argon2.hash('correctpassword');
      const mockUser = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
        nama: 'Test User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user when valid id is provided', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        nama: 'Test User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
        },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const userId = 'user-123';
      const oldPassword = 'oldPassword123';
      const newPassword = 'newPassword456';
      const hashedOldPassword = await argon2.hash(oldPassword);

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        password: hashedOldPassword,
        nama: 'User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword(userId, {
        oldPassword,
        newPassword,
      });

      expect(result).toEqual({ message: 'Password berhasil diubah' });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(updateCall.where.id).toBe(userId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(updateCall.data.password).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(typeof updateCall.data.password).toBe('string');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent-id', {
          oldPassword: 'oldPassword',
          newPassword: 'newPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      const userId = 'user-123';
      const hashedPassword = await argon2.hash('correctPassword');

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        password: hashedPassword,
        nama: 'User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(userId, {
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if new password same as old password', async () => {
      const userId = 'user-123';
      const password = 'samePassword123';
      const hashedPassword = await argon2.hash(password);

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        password: hashedPassword,
        nama: 'User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(userId, {
          oldPassword: password,
          newPassword: password,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
