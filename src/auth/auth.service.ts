import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import {
  RegisterDto,
  LoginDto,
  RegisterPelajarDto,
  ChangePasswordDto,
} from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nama, role } = registerDto;

    // Only ADMIN and PENGAJAR can be created through this endpoint
    // PELAJAR should use registerPelajar endpoint
    if (role === 'PELAJAR') {
      throw new ForbiddenException(
        'Use /auth/register/pelajar endpoint to register as student',
      );
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password with Argon2
    const hashedPassword = await argon2.hash(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        role,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async registerPelajar(registerDto: RegisterPelajarDto) {
    const { email, password, nama } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password with Argon2
    const hashedPassword = await argon2.hash(password);

    // Create user with PELAJAR role
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        role: Role.PELAJAR, // Always PELAJAR for this endpoint
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Student registered successfully',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password with Argon2
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    // Find user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await argon2.verify(user.password, oldPassword);

    if (!isOldPasswordValid) {
      throw new BadRequestException('Password lama tidak sesuai');
    }

    // Check if new password is same as old password
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'Password baru tidak boleh sama dengan password lama',
      );
    }

    // Hash new password
    const hashedNewPassword = await argon2.hash(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    return {
      message: 'Password berhasil diubah',
    };
  }
}
