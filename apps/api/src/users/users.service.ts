import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditEventType } from '@mcms/domain';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserSummaryDTO,
} from '@mcms/contracts';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserSummaryDTO[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toSummaryDTO(u));
  }

  async findOne(id: string): Promise<UserSummaryDTO> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
        staffProfile: true,
      },
    });

    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    return this.toSummaryDTO(user);
  }

  async create(
    dto: CreateUserRequest,
    actor: AuthenticatedUserEntity,
    ipAddress?: string,
  ): Promise<UserSummaryDTO> {
    const email = dto.email.toLowerCase().trim();

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException(`Email "${email}" is already registered`);

    // Validate that role IDs exist
    if (dto.roleIds.length > 0) {
      const roles = await this.prisma.role.findMany({ where: { id: { in: dto.roleIds } } });
      if (roles.length !== dto.roleIds.length) {
        throw new NotFoundException('One or more specified roles were not found');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const createData: Prisma.UserCreateInput = {
      email,
      displayName: dto.displayName,
      passwordHash,
      accountStatus: 'ACTIVE',
      userRoles: {
        create: dto.roleIds.map((roleId: string) => ({
          roleId,
          grantedBy: actor.id,
        })),
      },
    };

    if (dto.staffProfile) {
      createData.staffProfile = {
        create: {
          employeeNumber: dto.staffProfile.employeeNumber ?? null,
          jobTitle: dto.staffProfile.jobTitle ?? null,
          department: dto.staffProfile.department ?? null,
          phoneNumber: dto.staffProfile.phoneNumber ?? null,
          licenseNumber: dto.staffProfile.licenseNumber ?? null,
        },
      };
    }

    const user = await this.prisma.user.create({
      data: createData,
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
        staffProfile: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditEventType.USER_CREATED,
        resource: 'User',
        resourceId: user.id,
        ipAddress: ipAddress ?? null,
        payload: { email, roleIds: dto.roleIds },
      },
    });

    this.logger.log(`User ${email} created by ${actor.email}`);
    return this.toSummaryDTO(user);
  }

  async update(
    id: string,
    dto: UpdateUserRequest,
    actor: AuthenticatedUserEntity,
    ipAddress?: string,
  ): Promise<UserSummaryDTO> {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // Update base user fields
      const updated = await tx.user.update({
        where: { id },
        data: {
          ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
          ...(dto.isActive !== undefined
            ? { accountStatus: dto.isActive ? 'ACTIVE' : 'INACTIVE' }
            : {}),
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: { rolePermissions: { include: { permission: true } } },
              },
            },
          },
          staffProfile: true,
        },
      });

      // Update role assignments if provided
      if (dto.roleIds !== undefined) {
        const roles = await tx.role.findMany({ where: { id: { in: dto.roleIds } } });
        if (roles.length !== dto.roleIds.length) {
          throw new NotFoundException('One or more specified roles were not found');
        }

        // Remove existing assignments, re-create new ones
        await tx.userRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: dto.roleIds.map((roleId: string) => ({
              userId: id,
              roleId,
              grantedBy: actor.id,
            })),
          });
        }
      }

      // Update staff profile if provided
      if (dto.staffProfile !== undefined) {
        await tx.staffProfile.upsert({
          where: { userId: id },
          update: {
            employeeNumber: dto.staffProfile.employeeNumber ?? null,
            jobTitle: dto.staffProfile.jobTitle ?? null,
            department: dto.staffProfile.department ?? null,
            phoneNumber: dto.staffProfile.phoneNumber ?? null,
            licenseNumber: dto.staffProfile.licenseNumber ?? null,
          },
          create: {
            userId: id,
            employeeNumber: dto.staffProfile.employeeNumber ?? null,
            jobTitle: dto.staffProfile.jobTitle ?? null,
            department: dto.staffProfile.department ?? null,
            phoneNumber: dto.staffProfile.phoneNumber ?? null,
            licenseNumber: dto.staffProfile.licenseNumber ?? null,
          },
        });
      }

      return updated;
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditEventType.USER_UPDATED,
        resource: 'User',
        resourceId: id,
        ipAddress: ipAddress ?? null,
        payload: { ...dto } as any,
      },
    });

    return this.toSummaryDTO(updatedUser);
  }

  async deactivate(id: string, actor: AuthenticatedUserEntity, ipAddress?: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);

    if (id === actor.id) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    await this.prisma.user.update({
      where: { id },
      data: { accountStatus: 'INACTIVE' },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditEventType.USER_STATUS_CHANGED,
        resource: 'User',
        resourceId: id,
        ipAddress: ipAddress ?? null,
        payload: { status: 'INACTIVE' },
      },
    });
  }

  async activate(id: string, actor: AuthenticatedUserEntity, ipAddress?: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);

    await this.prisma.user.update({
      where: { id },
      data: { accountStatus: 'ACTIVE', failedLoginCount: 0, lockedAt: null },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditEventType.USER_STATUS_CHANGED,
        resource: 'User',
        resourceId: id,
        ipAddress: ipAddress ?? null,
        payload: { status: 'ACTIVE' },
      },
    });
  }

  private toSummaryDTO(user: any): UserSummaryDTO {
    const roles: string[] = user.userRoles?.map((ur: any) => ur.role.name) ?? [];
    const permissions: string[] = Array.from(
      new Set<string>(
        user.userRoles?.flatMap((ur: any) =>
          ur.role.rolePermissions?.map((rp: any) => rp.permission.slug) ?? [],
        ) ?? [],
      ),
    );

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isActive: user.accountStatus === 'ACTIVE',
      isLocked: user.accountStatus === 'LOCKED',
      roles,
      permissions,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
