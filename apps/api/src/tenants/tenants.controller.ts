import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../common/tenant/tenant-context.decorator';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  TenantDTO,
  CreateTenantRequest,
  UpdateTenantRequest,
} from '@mcms/contracts';
import { PermissionSlug } from '@mcms/domain';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.TENANTS_READ)
  async findAll(@CurrentUser() user: AuthenticatedUserEntity): Promise<TenantDTO[]> {
    return this.tenantsService.findAll(user);
  }

  @Get('current')
  @HttpCode(HttpStatus.OK)
  async findCurrent(@CurrentTenant() tenantId: string | null): Promise<TenantDTO> {
    return this.tenantsService.findCurrent(tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.TENANTS_READ)
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<TenantDTO> {
    return this.tenantsService.findById(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.TENANTS_WRITE)
  async create(
    @Body() body: CreateTenantRequest,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<TenantDTO> {
    return this.tenantsService.create(body, user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.TENANTS_WRITE)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTenantRequest,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<TenantDTO> {
    return this.tenantsService.update(id, body, user);
  }
}
