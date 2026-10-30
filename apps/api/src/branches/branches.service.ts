import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  BranchDTO,
  CreateBranchRequest,
  UpdateBranchRequest,
  DepartmentDTO,
  CreateDepartmentRequest,
} from '@mcms/contracts';
import { AuditEventType } from '@mcms/domain';
import { BranchStatus } from '@prisma/client';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapBranchToDTO(b: {
    id: string;
    tenantId: string;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    isMainBranch: boolean;
    status: BranchStatus;
    createdAt: Date;
    _count?: {
      departments: number;
      rooms: number;
      userBranches: number;
    };
  }): BranchDTO {
    return {
      id: b.id,
      tenantId: b.tenantId,
      name: b.name,
      code: b.code,
      address: b.address,
      phone: b.phone,
      email: b.email,
      isMainBranch: b.isMainBranch,
      isActive: b.status === BranchStatus.ACTIVE,
      createdAt: b.createdAt.toISOString(),
      departmentsCount: b._count?.departments ?? 0,
      roomsCount: b._count?.rooms ?? 0,
      bedsCount: 0,
      usersCount: b._count?.userBranches ?? 0,
    };
  }

  async findAll(
    user: AuthenticatedUserEntity,
    tenantId: string | null,
  ): Promise<BranchDTO[]> {
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    const effectiveTenantId = isSuperAdmin ? tenantId : user.tenantId;
    const where = effectiveTenantId ? { tenantId: effectiveTenantId } : {};

    const branches = await this.prisma.branch.findMany({
      where,
      include: {
        _count: {
          select: {
            departments: true,
            rooms: true,
            userBranches: true,
          },
        },
      },
      orderBy: [{ isMainBranch: 'desc' }, { name: 'asc' }],
    });

    return branches.map((b) => this.mapBranchToDTO(b));
  }

  async findById(id: string, user: AuthenticatedUserEntity): Promise<BranchDTO> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            departments: true,
            rooms: true,
            userBranches: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    if (!isSuperAdmin && user.tenantId !== branch.tenantId) {
      throw new ForbiddenException('Access denied to other tenants branches');
    }

    return this.mapBranchToDTO(branch);
  }

  async create(
    dto: CreateBranchRequest,
    user: AuthenticatedUserEntity,
    tenantId: string | null,
  ): Promise<BranchDTO> {
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    const isClinicAdmin = user.userRoles.some((ur) => ur.role.name === 'CLINIC_ADMIN');

    if (!isSuperAdmin && !isClinicAdmin) {
      throw new ForbiddenException('Only Clinic Admins and Super Admins can create branches');
    }

    const targetTenantId = isSuperAdmin ? (tenantId ?? user.tenantId) : user.tenantId;
    if (!targetTenantId) {
      throw new BadRequestException('A tenant context is required to create a branch');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: targetTenantId },
      include: { _count: { select: { branches: true } } },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const tenantSettings = (tenant.settings as Record<string, unknown>) ?? {};
    const maxBranches = (tenantSettings.maxBranches as number) ?? 5;
    if (tenant._count.branches >= maxBranches) {
      throw new BadRequestException(
        `Branch limit (${maxBranches}) reached for organization. Upgrade subscription plan to add more branches.`,
      );
    }

    const existingCode = await this.prisma.branch.findUnique({
      where: {
        tenantId_code: {
          tenantId: targetTenantId,
          code: dto.code.toUpperCase().trim(),
        },
      },
    });
    if (existingCode) {
      throw new ConflictException(`Branch code '${dto.code}' already exists in this organization`);
    }

    if (dto.isMainBranch) {
      await this.prisma.branch.updateMany({
        where: { tenantId: targetTenantId, isMainBranch: true },
        data: { isMainBranch: false },
      });
    }

    const branch = await this.prisma.branch.create({
      data: {
        tenantId: targetTenantId,
        name: dto.name,
        code: dto.code.toUpperCase().trim(),
        isMainBranch: dto.isMainBranch ?? false,
        status: BranchStatus.ACTIVE,
        ...(dto.address ? { address: dto.address } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.email ? { email: dto.email } : {}),
      },
      include: {
        _count: {
          select: {
            departments: true,
            rooms: true,
            userBranches: true,
          },
        },
      },
    });

    // Automatically link creator to this branch
    await this.prisma.userBranch.upsert({
      where: {
        userId_branchId: {
          userId: user.id,
          branchId: branch.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        branchId: branch.id,
        isPrimary: false,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditEventType.BRANCH_CREATED,
        resource: 'Branch',
        payload: { branchId: branch.id, name: branch.name, tenantId: targetTenantId },
      },
    });

    return this.mapBranchToDTO(branch);
  }

  async update(
    id: string,
    dto: UpdateBranchRequest,
    user: AuthenticatedUserEntity,
  ): Promise<BranchDTO> {
    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    const isClinicAdmin = user.userRoles.some((ur) => ur.role.name === 'CLINIC_ADMIN');

    if (!isSuperAdmin && !isClinicAdmin) {
      throw new ForbiddenException('Only Clinic Admins and Super Admins can update branches');
    }

    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    if (!isSuperAdmin && user.tenantId !== branch.tenantId) {
      throw new ForbiddenException('Cannot update branch belonging to another organization');
    }

    if (dto.isMainBranch) {
      await this.prisma.branch.updateMany({
        where: { tenantId: branch.tenantId, isMainBranch: true, id: { not: id } },
        data: { isMainBranch: false },
      });
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.code ? { code: dto.code.toUpperCase().trim() } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.isMainBranch !== undefined ? { isMainBranch: dto.isMainBranch } : {}),
        ...(dto.isActive !== undefined
          ? { status: dto.isActive ? BranchStatus.ACTIVE : BranchStatus.INACTIVE }
          : {}),
      },
      include: {
        _count: {
          select: {
            departments: true,
            rooms: true,
            userBranches: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditEventType.BRANCH_UPDATED,
        resource: 'Branch',
        payload: { branchId: id, updates: dto as any },
      },
    });

    return this.mapBranchToDTO(updated);
  }

  async getDepartments(branchId: string, user: AuthenticatedUserEntity): Promise<DepartmentDTO[]> {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    if (!isSuperAdmin && user.tenantId !== branch.tenantId) {
      throw new ForbiddenException('Access denied to other organizations departments');
    }

    const departments = await this.prisma.department.findMany({
      where: { branchId },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return departments.map((d) => ({
      id: d.id,
      branchId: d.branchId,
      name: d.name,
      code: d.code,
      type: d.description ?? 'CLINICAL',
      isActive: d.isActive,
      createdAt: d.createdAt.toISOString(),
      roomsCount: d._count.rooms,
    }));
  }

  async createDepartment(
    branchId: string,
    dto: CreateDepartmentRequest,
    user: AuthenticatedUserEntity,
  ): Promise<DepartmentDTO> {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    const isClinicAdmin = user.userRoles.some((ur) => ur.role.name === 'CLINIC_ADMIN');

    if (!isSuperAdmin && (!isClinicAdmin || user.tenantId !== branch.tenantId)) {
      throw new ForbiddenException('Not authorized to add departments to this branch');
    }

    const department = await this.prisma.department.create({
      data: {
        tenantId: branch.tenantId,
        branchId,
        name: dto.name,
        code: dto.code.toUpperCase().trim(),
        description: dto.type ?? 'CLINICAL',
        isActive: dto.isActive ?? true,
      },
    });

    return {
      id: department.id,
      branchId: department.branchId,
      name: department.name,
      code: department.code,
      type: department.description ?? 'CLINICAL',
      isActive: department.isActive,
      createdAt: department.createdAt.toISOString(),
      roomsCount: 0,
    };
  }
}
