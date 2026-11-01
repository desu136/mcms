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
  StaffProfileDTO,
} from '@mcms/contracts';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(actor?: AuthenticatedUserEntity): Promise<UserSummaryDTO[]> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (actor?.tenantId) {
      where.tenantId = actor.tenantId;
    }

    const users = await this.prisma.user.findMany({
      where: where as any,
      include: {
        tenant: {
          select: { id: true, name: true, settings: true },
        },
        staffProfile: true,
        userBranches: {
          include: { branch: { select: { id: true, name: true, code: true } } },
        },
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
        tenant: {
          select: { id: true, name: true, settings: true },
        },
        userBranches: {
          include: { branch: { select: { id: true, name: true, code: true } } },
        },
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
      ...(dto.tenantId ? { tenant: { connect: { id: dto.tenantId } } } : {}),
      userRoles: {
        create: dto.roleIds.map((roleId: string) => ({
          roleId,
          grantedBy: actor.id,
        })),
      },
    };

    if (dto.branchId) {
      createData.userBranches = {
        create: [
          {
            branchId: dto.branchId,
            isPrimary: true,
          },
        ],
      };
    }

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
        tenant: {
          select: { id: true, name: true, settings: true },
        },
        userBranches: {
          include: { branch: { select: { id: true, name: true, code: true } } },
        },
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
          tenant: {
            select: { id: true, name: true, settings: true },
          },
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

      // Update branch assignment if provided
      if (dto.branchId !== undefined) {
        if (dto.branchId) {
          await tx.userBranch.deleteMany({ where: { userId: id } });
          await tx.userBranch.create({
            data: {
              userId: id,
              branchId: dto.branchId,
              isPrimary: true,
            },
          });
        }
      }

      // Re-fetch to include relations
      return tx.user.findUnique({
        where: { id },
        include: {
          tenant: {
            select: { id: true, name: true, settings: true },
          },
          userBranches: {
            include: { branch: { select: { id: true, name: true, code: true } } },
          },
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

  async transferBranch(
    userId: string,
    targetBranchId: string,
    actor: AuthenticatedUserEntity,
    ipAddress?: string,
  ): Promise<UserSummaryDTO> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        userBranches: {
          include: { branch: { select: { id: true, name: true, code: true } } },
        },
      },
    });
    if (!user) throw new NotFoundException(`User with id "${userId}" not found`);

    const branch = await this.prisma.branch.findUnique({
      where: { id: targetBranchId },
    });
    if (!branch) throw new NotFoundException(`Branch with id "${targetBranchId}" not found`);

    if (user.tenantId && branch.tenantId !== user.tenantId) {
      throw new ForbiddenException('Cannot transfer staff to a branch of a different organization');
    }

    const previousBranch = user.userBranches?.find((ub) => ub.isPrimary) ?? user.userBranches?.[0];

    await this.prisma.$transaction(async (tx) => {
      await tx.userBranch.deleteMany({ where: { userId } });
      await tx.userBranch.create({
        data: {
          userId,
          branchId: targetBranchId,
          isPrimary: true,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: actor.id,
          action: 'STAFF_BRANCH_TRANSFERRED',
          resource: 'User',
          resourceId: userId,
          ipAddress: ipAddress ?? null,
          payload: {
            fromBranchId: previousBranch?.branchId ?? null,
            fromBranchName: previousBranch?.branch?.name ?? null,
            toBranchId: targetBranchId,
            toBranchName: branch.name,
          },
        },
      });
    });

    return this.findOne(userId);
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

    const tenantLicenseNumber = (user.tenant?.settings as Record<string, unknown> | null)?.licenseNumber as string | undefined;

    let staffProfile: StaffProfileDTO | undefined = undefined;
    if (user.staffProfile) {
      staffProfile = {
        ...(user.staffProfile.employeeNumber ? { employeeNumber: user.staffProfile.employeeNumber } : {}),
        ...(user.staffProfile.jobTitle ? { jobTitle: user.staffProfile.jobTitle } : {}),
        ...(user.staffProfile.department ? { department: user.staffProfile.department } : {}),
        ...(user.staffProfile.phoneNumber ? { phoneNumber: user.staffProfile.phoneNumber } : {}),
        ...(user.staffProfile.licenseNumber || tenantLicenseNumber
          ? { licenseNumber: user.staffProfile.licenseNumber ?? tenantLicenseNumber }
          : {}),
      };
    } else if (tenantLicenseNumber) {
      staffProfile = {
        licenseNumber: tenantLicenseNumber,
      };
    }

    const userBranches = user.userBranches ?? [];
    const primaryBranch = userBranches.find((ub: any) => ub.isPrimary) ?? userBranches[0];
    const primaryBranchId = primaryBranch?.branchId ?? null;
    const primaryBranchName = primaryBranch?.branch?.name ?? null;
    const branchIds = userBranches.map((ub: any) => ub.branchId);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isActive: user.accountStatus === 'ACTIVE',
      isLocked: user.accountStatus === 'LOCKED',
      roles,
      permissions,
      createdAt: user.createdAt.toISOString(),
      ...(user.tenantId ? { tenantId: user.tenantId } : {}),
      ...(user.tenant?.name ? { tenantName: user.tenant.name } : {}),
      primaryBranchId,
      primaryBranchName,
      branchIds,
      ...(staffProfile ? { staffProfile } : {}),
    };
  }
}
