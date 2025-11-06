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
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterPelajarDto, ChangePasswordDto } from './dto';
import { Roles, CurrentUser } from './decorators';
import { JwtAuthGuard, RolesGuard } from './guards';
import type { Response, Request } from 'express';

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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' for development, 'none' for production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return only access token and user info (not refresh token)
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
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
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Debug: Log all request details
    console.log('=== Refresh Token Debug ===');
    console.log('Headers:', req.headers);
    console.log('Cookies from req.cookies:', req.cookies);
    console.log('Cookie header:', req.headers.cookie);

    // Get refresh token from cookie
    let refreshToken = req.cookies?.refreshToken as string | undefined;

    // Fallback: try to parse from cookie header manually
    if (!refreshToken && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );

      refreshToken = cookies.refreshToken;
      console.log('Parsed from cookie header:', cookies);
    }

    if (!refreshToken) {
      console.error(
        'Refresh token not found. Available cookies:',
        Object.keys(req.cookies || {}),
      );
      throw new Error('Refresh token not found in cookies');
    }

    console.log('Using refresh token:', refreshToken);
    console.log('=========================');

    const result = await this.authService.refreshTokens({
      refreshToken,
    });

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' for development, 'none' for production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return only access token and user info
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return {
      message: 'Logged out successfully',
    };
  }
}
