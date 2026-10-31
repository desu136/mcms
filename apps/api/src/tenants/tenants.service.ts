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
import { TenantStatus } from '@prisma/client';

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
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
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
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
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
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    if (!isSuperAdmin) {
      throw new ForbiddenException('Only platform administrators can create tenants');
    }

    const existingSlug = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (existingSlug) {
      throw new ConflictException(`Tenant with slug '${dto.slug}' already exists`);
    }

    const existingCode = await this.prisma.tenant.findUnique({ where: { code: dto.code } });
    if (existingCode) {
      throw new ConflictException(`Tenant with code '${dto.code}' already exists`);
    }

    const created = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase().trim(),
        code: dto.code.toUpperCase().trim(),
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
        },
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
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    const isClinicAdmin = user.userRoles.some((ur) => ur.role.name === 'CLINIC_ADMIN');

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
