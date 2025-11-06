import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterPelajarDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto';
import { Roles, CurrentUser } from './decorators';
import { JwtAuthGuard, RolesGuard } from './guards';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterPelajarDto,
    @Query('token') token?: string,
  ) {
    // If token exists, register as pengajar with token validation
    if (token) {
      return this.authService.registerPengajarWithToken(registerDto, token);
    }
    // Otherwise, register as pelajar
    return this.authService.registerPelajar(registerDto);
  }

  @Post('invite-pengajar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async invitePengajar(@Body('email') email: string) {
    return this.authService.createPengajarInvitation(email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: Express.User) {
    return this.authService.validateUser(user.sub);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: Express.User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, changePasswordDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
