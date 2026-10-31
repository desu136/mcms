import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditEventType, PermissionSlug } from '@mcms/domain';
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
import type { AuthenticatedUserEntity } from './types/authenticated-user.type';
import type { JwtPayload } from './types/jwt-payload.type';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MINUTES = 30;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_DAYS = 7;
const PASSWORD_RESET_TTL_MINUTES = 30;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginRequest, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
        userBranches: {
          include: { branch: true },
        },
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
        staffProfile: true,
      },
    });

    // Generic error to prevent user enumeration
    if (!user) {
      this.logger.warn(`Login attempt for unknown email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account status
    if (user.accountStatus === 'LOCKED') {
      // Auto-unlock after lock duration
      const lockedAt = user.lockedAt!;
      const unlockAt = new Date(lockedAt.getTime() + LOCK_DURATION_MINUTES * 60 * 1000);
      if (new Date() < unlockAt) {
        await this.createAuditLog(user.id, AuditEventType.AUTH_LOGIN_FAILURE, 'User', ipAddress, {
          reason: 'account_locked',
        });
        throw new ForbiddenException(
          `Account is locked. Try again after ${unlockAt.toISOString()}`,
        );
      }
      // Auto-unlock
      await this.prisma.user.update({
        where: { id: user.id },
        data: { accountStatus: 'ACTIVE', failedLoginCount: 0, lockedAt: null },
      });
    }

    if (user.accountStatus === 'INACTIVE') {
      throw new ForbiddenException('Account is inactive. Contact your administrator.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      await this.handleFailedLogin(user.id, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful login — reset failure count
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedAt: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress ?? null,
      },
    });

    const primaryBranch = user.userBranches.find((ub) => ub.isPrimary) ?? user.userBranches[0];
    const roles = user.userRoles.map((ur) => ur.role.name);
    const roleHierarchy = [
      'SUPER_ADMIN',
      'CLINIC_ADMIN',
      'DOCTOR',
      'NURSE',
      'LAB_TECHNICIAN',
      'RECEPTIONIST',
      'PATIENT',
    ];
    const primaryRole =
      roles
        .slice()
        .sort((a, b) => roleHierarchy.indexOf(a) - roleHierarchy.indexOf(b))[0] ?? 'PATIENT';

    const { accessToken, refreshToken, jti, tokenFamily } =
      await this.generateTokenPair(
        user.id,
        email,
        user.tenantId,
        primaryBranch?.branchId ?? null,
        primaryRole,
        ipAddress,
        userAgent,
      );

    await this.createAuditLog(user.id, AuditEventType.AUTH_LOGIN_SUCCESS, 'User', ipAddress, {
      tokenFamily,
      tenantId: user.tenantId,
      branchId: primaryBranch?.branchId,
    });

    return {
      accessToken,
      refreshToken,
      user: this.mapToAuthenticatedUser(user as unknown as AuthenticatedUserEntity),
    };
  }

  // ─── Refresh ─────────────────────────────────────────────────────────────────

  async refresh(
    dto: RefreshTokenRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshTokenResponse> {
    const tokenHash = this.hashToken(dto.refreshToken);

    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: {
        user: {
          include: {
            userRoles: { include: { role: true } },
            userBranches: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Token reuse detection — if already revoked, revoke entire token family
    if (session.revokedAt) {
      this.logger.warn(
        `Refresh token reuse detected for user ${session.userId}. Revoking family ${session.tokenFamily}.`,
      );
      await this.revokeTokenFamily(session.tokenFamily);
      await this.createAuditLog(
        session.userId,
        AuditEventType.AUTH_TOKEN_REUSE_DETECTED,
        'AuthSession',
        ipAddress,
        { tokenFamily: session.tokenFamily },
      );
      throw new UnauthorizedException('Token reuse detected. All sessions have been revoked.');
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check user is still active
    if (session.user.accountStatus !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    // Revoke the current session (rotation)
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const primaryBranch =
      session.user.userBranches.find((ub) => ub.isPrimary) ?? session.user.userBranches[0];
    const roles = session.user.userRoles.map((ur) => ur.role.name);
    const roleHierarchy = [
      'SUPER_ADMIN',
      'CLINIC_ADMIN',
      'DOCTOR',
      'NURSE',
      'LAB_TECHNICIAN',
      'RECEPTIONIST',
      'PATIENT',
    ];
    const primaryRole =
      roles
        .slice()
        .sort((a, b) => roleHierarchy.indexOf(a) - roleHierarchy.indexOf(b))[0] ?? 'PATIENT';

    // Issue new token pair in the same family
    const { accessToken, refreshToken } = await this.generateTokenPair(
      session.userId,
      session.user.email,
      session.user.tenantId,
      primaryBranch?.branchId ?? null,
      primaryRole,
      ipAddress,
      userAgent,
      session.tokenFamily,
    );

    await this.createAuditLog(
      session.userId,
      AuditEventType.AUTH_TOKEN_REFRESH,
      'AuthSession',
      ipAddress,
    );

    return { accessToken, refreshToken };
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout(user: AuthenticatedUserEntity, jti: string, ipAddress?: string): Promise<LogoutResponse> {
    // Revoke the specific session associated with this access token
    const session = await this.prisma.authSession.findUnique({
      where: { accessTokenJti: jti },
    });

    if (session) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }

    await this.createAuditLog(user.id, AuditEventType.AUTH_LOGOUT, 'AuthSession', ipAddress);
    return { message: 'Logged out successfully' };
  }

  // ─── Logout All Sessions ─────────────────────────────────────────────────────

  async logoutAll(user: AuthenticatedUserEntity, ipAddress?: string): Promise<LogoutResponse> {
    await this.prisma.authSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.createAuditLog(user.id, AuditEventType.AUTH_LOGOUT, 'AuthSession', ipAddress, {
      all: true,
    });

    return { message: 'All sessions have been logged out successfully' };
  }

  // ─── Password Reset Request ───────────────────────────────────────────────────

  async requestPasswordReset(
    dto: PasswordResetRequest,
    ipAddress?: string,
  ): Promise<PasswordResetResponse> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return a success-like response to prevent user enumeration
    if (!user || user.accountStatus === 'INACTIVE') {
      return {
        message: 'If that email is registered, a reset link has been sent.',
      };
    }

    // Invalidate existing unused reset tokens
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() }, // mark as used/expired
    });

    const rawToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000),
      },
    });

    await this.createAuditLog(
      user.id,
      AuditEventType.AUTH_PASSWORD_RESET_REQUESTED,
      'User',
      ipAddress,
    );

    this.logger.log(`Password reset requested for ${email}`);

    // In production: send email with link. In dev, return token.
    const isDev = this.config.get<string>('NODE_ENV') !== 'production';
    return {
      message: 'If that email is registered, a reset link has been sent.',
      ...(isDev ? { resetToken: rawToken } : {}),
    };
  }

  // ─── Password Reset Confirm ───────────────────────────────────────────────────

  async confirmPasswordReset(
    dto: PasswordResetConfirmRequest,
    ipAddress?: string,
  ): Promise<PasswordResetConfirmResponse> {
    const tokenHash = this.hashToken(dto.token);

    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash: newHash,
          passwordChangedAt: new Date(),
          failedLoginCount: 0,
          accountStatus: 'ACTIVE',
          lockedAt: null,
        },
      }),
      // Revoke all existing sessions after password reset
      this.prisma.authSession.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.createAuditLog(
      resetRecord.userId,
      AuditEventType.AUTH_PASSWORD_RESET_CONFIRMED,
      'User',
      ipAddress,
    );

    return { message: 'Password has been reset successfully. Please log in again.' };
  }

  async switchBranch(
    user: AuthenticatedUserEntity,
    branchId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; activeBranchId: string; user: AuthenticatedUser }> {
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    if (!isSuperAdmin) {
      const hasBranch = user.userBranches?.some((ub) => ub.branchId === branchId);
      if (!hasBranch) {
        throw new ForbiddenException('User is not authorized for the requested branch');
      }
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { tenant: true },
    });
    if (!branch || branch.status !== 'ACTIVE') {
      throw new BadRequestException('Invalid or inactive branch');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const roleHierarchy = [
      'SUPER_ADMIN',
      'CLINIC_ADMIN',
      'DOCTOR',
      'NURSE',
      'LAB_TECHNICIAN',
      'RECEPTIONIST',
      'PATIENT',
    ];
    const primaryRole =
      roles
        .slice()
        .sort((a, b) => roleHierarchy.indexOf(a) - roleHierarchy.indexOf(b))[0] ?? 'PATIENT';

    const { accessToken, refreshToken, jti } = await this.generateTokenPair(
      user.id,
      user.email,
      branch.tenantId,
      branch.id,
      primaryRole,
      ipAddress,
      userAgent,
    );

    await this.createAuditLog(user.id, AuditEventType.SYSTEM_CONFIG_UPDATED, 'Branch', ipAddress, {
      switchedToBranchId: branch.id,
    });

    const mappedUser = this.mapToAuthenticatedUser(user);
    mappedUser.activeBranchId = branch.id;

    return {
      accessToken,
      refreshToken,
      activeBranchId: branch.id,
      user: mappedUser,
    };
  }

  // ─── Me (current user profile) ───────────────────────────────────────────────

  mapToAuthenticatedUser(user: AuthenticatedUserEntity): AuthenticatedUser {
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.slug),
        ),
      ),
    );

    // Derive primary role for backwards-compat — prefer highest privilege
    const roleHierarchy = [
      'SUPER_ADMIN',
      'CLINIC_ADMIN',
      'DOCTOR',
      'NURSE',
      'LAB_TECHNICIAN',
      'RECEPTIONIST',
      'PATIENT',
    ];
    const primaryRole =
      roles
        .slice()
        .sort((a, b) => roleHierarchy.indexOf(a) - roleHierarchy.indexOf(b))[0] ?? 'PATIENT';

    const tenant = user.tenant
      ? {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          code: user.tenant.code,
          logoUrl: user.tenant.logoUrl,
        }
      : null;

    const branches = (user.userBranches ?? []).map((ub) => ({
      id: ub.branch.id,
      name: ub.branch.name,
      code: ub.branch.code,
      isMainBranch: ub.branch.isMainBranch,
      isPrimary: ub.isPrimary,
    }));

    const primaryBranch =
      user.userBranches?.find((ub) => ub.isPrimary) ?? user.userBranches?.[0];
    const activeBranchId = primaryBranch?.branchId;

    const result: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: primaryRole as any,
      roles,
      permissions,
      tenant,
      branches,
      ...(activeBranchId ? { activeBranchId } : {}),
    };

    if (user.staffProfile) {
      result.staffProfile = {
        ...(user.staffProfile.employeeNumber ? { employeeNumber: user.staffProfile.employeeNumber } : {}),
        ...(user.staffProfile.jobTitle ? { jobTitle: user.staffProfile.jobTitle } : {}),
        ...(user.staffProfile.department ? { department: user.staffProfile.department } : {}),
        ...(user.staffProfile.phoneNumber ? { phoneNumber: user.staffProfile.phoneNumber } : {}),
        ...(user.staffProfile.licenseNumber ? { licenseNumber: user.staffProfile.licenseNumber } : {}),
      };
    }

    return result;
  }

  // ─── Internal Helpers ─────────────────────────────────────────────────────────

  private async generateTokenPair(
    userId: string,
    email: string,
    tenantId?: string | null,
    activeBranchId?: string | null,
    role?: string,
    ipAddress?: string,
    userAgent?: string,
    existingFamily?: string,
  ) {
    const jti = crypto.randomUUID();
    const tokenFamily = existingFamily ?? crypto.randomUUID();

    const payload: JwtPayload = {
      sub: userId,
      email,
      tenantId: tenantId ?? null,
      activeBranchId: activeBranchId ?? null,
      jti,
      type: 'access',
      ...(role ? { role } : {}),
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });

    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = this.hashToken(rawRefreshToken);

    await this.prisma.authSession.create({
      data: {
        userId,
        tokenFamily,
        refreshTokenHash,
        accessTokenJti: jti,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken, jti, tokenFamily };
  }

  private async handleFailedLogin(userId: string, ipAddress?: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const newCount = user.failedLoginCount + 1;

    if (newCount >= MAX_FAILED_LOGINS) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginCount: newCount,
          accountStatus: 'LOCKED',
          lockedAt: new Date(),
        },
      });
      this.logger.warn(`Account locked for user ${userId} after ${newCount} failed attempts`);
      await this.createAuditLog(userId, AuditEventType.AUTH_ACCOUNT_LOCKED, 'User', ipAddress, {
        failedAttempts: newCount,
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { failedLoginCount: newCount },
      });
      await this.createAuditLog(
        userId,
        AuditEventType.AUTH_LOGIN_FAILURE,
        'User',
        ipAddress,
        { failedAttempts: newCount },
      );
    }
  }

  private async revokeTokenFamily(tokenFamily: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { tokenFamily, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async createAuditLog(
    userId: string,
    action: AuditEventType,
    resource: string,
    ipAddress?: string,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        ipAddress: ipAddress ?? null,
        payload: payload ? (payload as any) : undefined,
      },
    });
  }
}
