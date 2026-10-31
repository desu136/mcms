import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedUserEntity } from './types/authenticated-user.type';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  AuthenticatedUser,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
} from '@mcms/contracts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequest, @Req() req: Request): Promise<LoginResponse> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    const ua = req.headers['user-agent'];
    return this.authService.login(body, ip, ua);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshTokenRequest,
    @Req() req: Request,
  ): Promise<RefreshTokenResponse> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    const ua = req.headers['user-agent'];
    return this.authService.refresh(body, ip, ua);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<LogoutResponse> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    const jti = user.currentJti ?? '';
    return this.authService.logout(user, jti, ip);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<LogoutResponse> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.authService.logoutAll(user, ip);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: AuthenticatedUserEntity): Promise<AuthenticatedUser> {
    return this.authService.mapToAuthenticatedUser(user);
  }

  @Post('switch-branch')
  @HttpCode(HttpStatus.OK)
  async switchBranch(
    @CurrentUser() user: AuthenticatedUserEntity,
    @Body('branchId') branchId: string,
    @Req() req: Request,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    const ua = req.headers['user-agent'];
    return this.authService.switchBranch(user, branchId, ip, ua);
  }

  @Public()
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() body: PasswordResetRequest,
    @Req() req: Request,
  ): Promise<PasswordResetResponse> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.authService.requestPasswordReset(body, ip);
  }

  @Public()
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body() body: PasswordResetConfirmRequest,
    @Req() req: Request,
  ): Promise<PasswordResetConfirmResponse> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.authService.confirmPasswordReset(body, ip);
  }
}
