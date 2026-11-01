import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  TenantDTO,
  CreateTenantRequest,
  UpdateTenantRequest,
} from '@mcms/contracts';
import { AuditEventType } from '@mcms/domain';
import { TenantStatus, BranchStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTenantToDTO(t: {
    id: string;
    name: string;
    slug: string;
    code: string;
    address: string | null;
    city: string | null;
    country: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    logoUrl: string | null;
    status: TenantStatus;
    settings: any;
    createdAt: Date;
    _count?: { branches: number; users: number };
  }): TenantDTO {
    const settings = (t.settings as Record<string, unknown>) ?? {};
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      code: t.code,
      address: t.address ? `${t.address}${t.city ? ', ' + t.city : ''}` : t.city ?? null,
      phone: t.contactPhone,
      email: t.contactEmail,
      licenseNumber: (settings.licenseNumber as string) ?? null,
      currency: (settings.currency as string) ?? 'ETB',
      timezone: (settings.timezone as string) ?? 'Africa/Addis_Ababa',
      logoUrl: t.logoUrl,
      subscriptionPlan: (settings.subscriptionPlan as string) ?? 'PROFESSIONAL',
      maxBranches: (settings.maxBranches as number) ?? 5,
      maxUsers: (settings.maxUsers as number) ?? 100,
      isActive: t.status === TenantStatus.ACTIVE,
      createdAt: t.createdAt.toISOString(),
      branchCount: t._count?.branches ?? 0,
      userCount: t._count?.users ?? 0,
    };
  }

  async findAll(user: AuthenticatedUserEntity): Promise<TenantDTO[]> {
    const isSuperAdmin = user.userRoles?.some((ur) => ur.role?.name === 'SUPER_ADMIN') ?? false;
    const where = isSuperAdmin ? {} : { id: user.tenantId ?? 'none' };

    const tenants = await this.prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((t) => this.mapTenantToDTO(t));
  }

  async findCurrent(tenantId: string | null): Promise<TenantDTO> {
    if (!tenantId) {
      throw new NotFoundException('No active tenant context found');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    return this.mapTenantToDTO(tenant);
  }

  async findById(id: string, user: AuthenticatedUserEntity): Promise<TenantDTO> {
    const isSuperAdmin = user.userRoles?.some((ur) => ur.role?.name === 'SUPER_ADMIN') ?? false;
    if (!isSuperAdmin && user.tenantId !== id) {
      throw new ForbiddenException('Access denied to other tenants');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return this.mapTenantToDTO(tenant);
  }

  async create(dto: CreateTenantRequest, user: AuthenticatedUserEntity): Promise<TenantDTO> {
    const isSuperAdmin = user.userRoles?.some((ur) => ur.role?.name === 'SUPER_ADMIN') ?? false;
    if (!isSuperAdmin) {
      throw new ForbiddenException('Only platform administrators can create tenants');
    }

    const slug = (
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    ).toLowerCase().trim();

    const code = (
      dto.code ||
      dto.name
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 6)
        .toUpperCase() ||
      'CLINIC'
    ).toUpperCase().trim();

    const existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Tenant with slug '${slug}' already exists`);
    }

    const existingCode = await this.prisma.tenant.findUnique({ where: { code } });
    if (existingCode) {
      throw new ConflictException(`Tenant with code '${code}' already exists`);
    }

    if (dto.adminEmail) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.adminEmail.toLowerCase().trim() },
      });
      if (existingUser) {
        throw new ConflictException(`User with email '${dto.adminEmail}' already exists`);
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug,
          code,
          status: TenantStatus.ACTIVE,
          ...(dto.address ? { address: dto.address } : {}),
          ...(dto.phone ? { contactPhone: dto.phone } : {}),
          ...(dto.email ? { contactEmail: dto.email } : {}),
          ...(dto.logoUrl ? { logoUrl: dto.logoUrl } : {}),
          settings: {
            currency: dto.currency ?? 'ETB',
            timezone: dto.timezone ?? 'Africa/Addis_Ababa',
            subscriptionPlan: dto.subscriptionPlan ?? 'PROFESSIONAL',
            maxBranches: dto.maxBranches ?? 5,
            maxUsers: dto.maxUsers ?? 100,
            ...(dto.licenseNumber ? { licenseNumber: dto.licenseNumber } : {}),
          },
        },
      });

      // Automatically create Main Branch with the clinic name
      const mainBranch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: dto.name,
          code: 'MAIN',
          isMainBranch: true,
          status: BranchStatus.ACTIVE,
          ...(dto.address ? { address: dto.address } : {}),
          ...(dto.phone ? { phone: dto.phone } : {}),
          ...(dto.email ? { email: dto.email } : {}),
        },
      });

      // Provision CLINIC_ADMIN user if credentials provided
      if (dto.adminEmail && dto.adminPassword) {
        const passwordHash = await bcrypt.hash(dto.adminPassword, 12);

        const clinicAdminRole = await tx.role.findUnique({
          where: { name: 'CLINIC_ADMIN' },
        });

        await tx.user.create({
          data: {
            email: dto.adminEmail.toLowerCase().trim(),
            displayName: dto.adminName || `${dto.name} Administrator`,
            passwordHash,
            tenantId: tenant.id,
            userBranches: {
              create: {
                branchId: mainBranch.id,
                isPrimary: true,
              },
            },
            ...(clinicAdminRole
              ? {
                  userRoles: {
                    create: {
                      roleId: clinicAdminRole.id,
                    },
                  },
                }
              : {}),
            staffProfile: {
              create: {
                jobTitle: 'Clinic Administrator',
                department: 'Administration',
                licenseNumber: dto.licenseNumber ?? null,
                phoneNumber: dto.phone ?? null,
              },
            },
          },
        });
      }

      return tx.tenant.findUnique({
        where: { id: tenant.id },
        include: {
          _count: {
            select: {
              branches: true,
              users: true,
            },
          },
        },
      });
    });

    if (!created) {
      throw new NotFoundException('Failed to retrieve created tenant');
    }

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditEventType.TENANT_CREATED,
        resource: 'Tenant',
        payload: { tenantId: created.id, name: created.name },
      },
    });

    return this.mapTenantToDTO(created);
  }

  async update(
    id: string,
    dto: UpdateTenantRequest,
    user: AuthenticatedUserEntity,
  ): Promise<TenantDTO> {
    const isSuperAdmin = user.userRoles?.some((ur) => ur.role?.name === 'SUPER_ADMIN') ?? false;
    const isClinicAdmin = user.userRoles?.some((ur) => ur.role?.name === 'CLINIC_ADMIN') ?? false;

    if (!isSuperAdmin && (!isClinicAdmin || user.tenantId !== id)) {
      throw new ForbiddenException('Not authorized to update this tenant');
    }

    const existing = await this.prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    const existingSettings = (existing.settings as Record<string, unknown>) ?? {};
    const updatedSettings = {
      ...existingSettings,
      ...(dto.currency ? { currency: dto.currency } : {}),
      ...(dto.timezone ? { timezone: dto.timezone } : {}),
      ...(dto.licenseNumber ? { licenseNumber: dto.licenseNumber } : {}),
      ...(isSuperAdmin && dto.subscriptionPlan ? { subscriptionPlan: dto.subscriptionPlan } : {}),
      ...(isSuperAdmin && dto.maxBranches !== undefined ? { maxBranches: dto.maxBranches } : {}),
      ...(isSuperAdmin && dto.maxUsers !== undefined ? { maxUsers: dto.maxUsers } : {}),
    };

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.phone !== undefined ? { contactPhone: dto.phone } : {}),
        ...(dto.email !== undefined ? { contactEmail: dto.email } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
        settings: updatedSettings,
        ...(isSuperAdmin && dto.isActive !== undefined
          ? { status: dto.isActive ? TenantStatus.ACTIVE : TenantStatus.INACTIVE }
          : {}),
      },
      include: {
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditEventType.TENANT_UPDATED,
        resource: 'Tenant',
        payload: { tenantId: id, updates: dto as any },
      },
    });

    return this.mapTenantToDTO(updated);
  }
}
