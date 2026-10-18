import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditEventType } from '@mcms/domain';
import type { RoleDTO, PermissionDTO } from '@mcms/contracts';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Roles ────────────────────────────────────────────────────────────────────

  async findAllRoles(): Promise<RoleDTO[]> {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => this.toRoleDTO(r));
  }

  async findRoleById(id: string): Promise<RoleDTO> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException(`Role "${id}" not found`);
    return this.toRoleDTO(role);
  }

  async createRole(
    data: { name: string; description?: string },
    actor: AuthenticatedUserEntity,
    ipAddress?: string,
  ): Promise<RoleDTO> {
    const exists = await this.prisma.role.findUnique({ where: { name: data.name } });
    if (exists) throw new ConflictException(`Role "${data.name}" already exists`);

    const role = await this.prisma.role.create({
      data: { name: data.name, description: data.description ?? '' },
      include: { rolePermissions: { include: { permission: true } } },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditEventType.ROLE_CREATED,
        resource: 'Role',
        resourceId: role.id,
        ipAddress: ipAddress ?? null,
        payload: { name: data.name },
      },
    });

    return this.toRoleDTO(role);
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    actor: AuthenticatedUserEntity,
    ipAddress?: string,
  ): Promise<RoleDTO> {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Role "${roleId}" not found`);

    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be modified');
    }

    const perms = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (perms.length !== permissionIds.length) {
      throw new NotFoundException('One or more specified permissions were not found');
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      }),
    ]);

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: AuditEventType.ROLE_PERMISSIONS_UPDATED,
        resource: 'Role',
        resourceId: roleId,
        ipAddress: ipAddress ?? null,
        payload: { permissionIds },
      },
    });

    const updated = await this.prisma.role.findUniqueOrThrow({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    });

    return this.toRoleDTO(updated);
  }

  // ─── Permissions ──────────────────────────────────────────────────────────────

  async findAllPermissions(): Promise<PermissionDTO[]> {
    const perms = await this.prisma.permission.findMany({ orderBy: { slug: 'asc' } });
    return perms.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      module: p.module,
      description: p.description,
    }));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private toRoleDTO(role: any): RoleDTO {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      permissions: role.rolePermissions?.map((rp: any) => rp.permission.slug) ?? [],
    };
  }
}
