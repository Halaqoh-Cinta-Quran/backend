import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        nama: 'New User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: createUserDto.email,
        nama: createUserDto.nama,
        role: createUserDto.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('email', createUserDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        nama: 'Existing User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          nama: 'User 1',
          role: Role.PELAJAR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          nama: 'User 2',
          role: Role.PENGAJAR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        nama: 'Test User',
        role: Role.PELAJAR,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        nama: 'Updated Name',
        email: 'updated@example.com',
      };

      const existingUser = {
        id: '1',
        email: 'old@example.com',
        nama: 'Old Name',
        role: Role.PELAJAR,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(result.nama).toBe(updateUserDto.nama);
      expect(result.email).toBe(updateUserDto.email);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        nama: 'Test User',
        role: Role.PELAJAR,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('1');

      expect(result).toHaveProperty('message', 'User deleted successfully');
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
