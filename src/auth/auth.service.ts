import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import {
  LoginDto,
  RegisterPelajarDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerPelajar(registerDto: RegisterPelajarDto) {
    const { email, password, nama, fullName, cities, address, phoneNumber } =
      registerDto;

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
        fullName,
        cities,
        address,
        phoneNumber,
        role: Role.PELAJAR, // Always PELAJAR for this endpoint
      },
      select: {
        id: true,
        email: true,
        nama: true,
        fullName: true,
        cities: true,
        address: true,
        phoneNumber: true,
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

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    // Find refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      // Delete expired token
      await this.prisma.refreshToken.deleteMany({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );

    // Delete old refresh token (use deleteMany to avoid error if already deleted)
    await this.prisma.refreshToken.deleteMany({
      where: { id: storedToken.id },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        nama: storedToken.user.nama,
        role: storedToken.user.role,
      },
    };
  }

  async logout(refreshToken: string) {
    // Delete refresh token from database
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    // Generate access token (short-lived: 15 minutes)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Generate refresh token (long-lived: 7 days)
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nama: true,
        fullName: true,
        cities: true,
        address: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

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

  async createPengajarInvitation(email: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if invitation already exists and not used
    const existingInvitation = await this.prisma.pengajarInvitation.findUnique({
      where: { email },
    });

    if (existingInvitation && !existingInvitation.used) {
      throw new ConflictException('Invitation already sent to this email');
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create or update invitation
    const invitation = await this.prisma.pengajarInvitation.upsert({
      where: { email },
      update: {
        token,
        expiresAt,
        used: false,
      },
      create: {
        email,
        token,
        expiresAt,
      },
    });

    // TODO: Send email with magic link
    // For now, return the token directly
    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${token}`;

    return {
      message: 'Invitation created successfully',
      email: invitation.email,
      magicLink, // In production, this should be sent via email
      expiresAt: invitation.expiresAt,
    };
  }

  async registerPengajarWithToken(
    registerDto: RegisterPelajarDto,
    token: string,
  ) {
    // Find and validate invitation
    const invitation = await this.prisma.pengajarInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (invitation.used) {
      throw new BadRequestException('Invitation token already used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation token expired');
    }

    // Check if email matches
    if (invitation.email !== registerDto.email) {
      throw new BadRequestException('Email does not match invitation');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const { email, password, nama, fullName, cities, address, phoneNumber } =
      registerDto;

    // Hash password with Argon2
    const hashedPassword = await argon2.hash(password);

    // Create user with PENGAJAR role
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        fullName,
        cities,
        address,
        phoneNumber,
        role: Role.PENGAJAR, // Always PENGAJAR when using token
      },
      select: {
        id: true,
        email: true,
        nama: true,
        fullName: true,
        cities: true,
        address: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
    });

    // Mark invitation as used
    await this.prisma.pengajarInvitation.update({
      where: { token },
      data: { used: true },
    });

    return {
      message: 'Teacher registered successfully',
      user,
    };
  }
}
