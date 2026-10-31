import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Check if the access token has been explicitly revoked (blocklisted by jti)
    const session = await this.prisma.authSession.findUnique({
      where: { accessTokenJti: payload.jti },
    });

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        tenant: true,
        userBranches: {
          include: { branch: true },
        },
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        staffProfile: true,
      },
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return Object.assign(user, { currentJti: payload.jti });
  }
}
