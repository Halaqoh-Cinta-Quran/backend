import { Test, TestingModule } from '@nestjs/testing';
import { SemesterService } from './semester.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { SemesterStatus } from '@prisma/client';

describe('SemesterService', () => {
  let service: SemesterService;

  const mockPrismaService = {
    semester: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemesterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SemesterService>(SemesterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new semester', async () => {
      const createDto = {
        nama: 'Semester 1 2024/2025',
        tanggalMulai: '2024-08-01',
        tanggalAkhir: '2024-12-31',
        status: SemesterStatus.AKTIF,
      };

      const createdSemester = {
        id: '1',
        nama: createDto.nama,
        tanggalMulai: new Date(createDto.tanggalMulai),
        tanggalAkhir: new Date(createDto.tanggalAkhir),
        status: createDto.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.semester.create.mockResolvedValue(createdSemester);

      const result = await service.create(createDto);

      expect(result).toEqual(createdSemester);
      expect(mockPrismaService.semester.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all semesters', async () => {
      const mockSemesters = [
        {
          id: '1',
          nama: 'Semester 1',
          tahunAjaran: '2024/2025',
          status: SemesterStatus.AKTIF,
          tanggalMulai: new Date(),
          tanggalSelesai: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.semester.findMany.mockResolvedValue(mockSemesters);

      const result = await service.findAll();

      expect(result).toEqual(mockSemesters);
    });
  });

  describe('findOne', () => {
    it('should return a semester by id', async () => {
      const mockSemester = {
        id: '1',
        nama: 'Semester 1',
        tahunAjaran: '2024/2025',
        status: SemesterStatus.AKTIF,
        tanggalMulai: new Date(),
        tanggalSelesai: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.semester.findUnique.mockResolvedValue(mockSemester);

      const result = await service.findOne('1');

      expect(result).toEqual(mockSemester);
    });

    it('should throw NotFoundException if semester not found', async () => {
      mockPrismaService.semester.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a semester', async () => {
      const updateDto = {
        nama: 'Updated Semester Name',
        status: SemesterStatus.SELESAI,
      };

      const existingSemester = {
        id: '1',
        nama: 'Old Name',
        tahunAjaran: '2024/2025',
        status: SemesterStatus.AKTIF,
        tanggalMulai: new Date(),
        tanggalSelesai: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSemester = {
        ...existingSemester,
        ...updateDto,
      };

      mockPrismaService.semester.findUnique.mockResolvedValue(existingSemester);
      mockPrismaService.semester.update.mockResolvedValue(updatedSemester);

      const result = await service.update('1', updateDto);

      expect(result.nama).toBe(updateDto.nama);
      expect(result.status).toBe(updateDto.status);
    });
  });

  describe('remove', () => {
    it('should delete a semester', async () => {
      const mockSemester = {
        id: '1',
        nama: 'Semester 1',
        tahunAjaran: '2024/2025',
        status: SemesterStatus.AKTIF,
        tanggalMulai: new Date(),
        tanggalSelesai: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.semester.findUnique.mockResolvedValue(mockSemester);
      mockPrismaService.semester.delete.mockResolvedValue(mockSemester);

      await service.remove('1');

      expect(mockPrismaService.semester.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
