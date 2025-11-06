import { Controller, Post, Body, UseGuards, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RegisterPelajarDto,
  ChangePasswordDto,
} from './dto';
import { Roles, CurrentUser } from './decorators';
import { JwtAuthGuard, RolesGuard } from './guards';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register/pelajar')
  async registerPelajar(@Body() registerDto: RegisterPelajarDto) {
    return this.authService.registerPelajar(registerDto);
  }

  @Post('login')
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
}
