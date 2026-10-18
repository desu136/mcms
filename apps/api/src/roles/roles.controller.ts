import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RolesService } from './roles.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionSlug } from '@mcms/domain';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type { RoleDTO, PermissionDTO } from '@mcms/contracts';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions(PermissionSlug.ROLES_READ)
  async findAll(): Promise<RoleDTO[]> {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @RequirePermissions(PermissionSlug.ROLES_READ)
  async findOne(@Param('id') id: string): Promise<RoleDTO> {
    return this.rolesService.findRoleById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.ROLES_MANAGE)
  async create(
    @Body() body: { name: string; description?: string },
    @CurrentUser() actor: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<RoleDTO> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.rolesService.createRole(body, actor, ip);
  }

  @Put(':id/permissions')
  @RequirePermissions(PermissionSlug.ROLES_MANAGE)
  async assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
    @CurrentUser() actor: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<RoleDTO> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.rolesService.assignPermissionsToRole(id, body.permissionIds, actor, ip);
  }
}

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions(PermissionSlug.PERMISSIONS_READ)
  async findAll(): Promise<PermissionDTO[]> {
    return this.rolesService.findAllPermissions();
  }
}
