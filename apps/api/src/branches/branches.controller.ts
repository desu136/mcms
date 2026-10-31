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
import { BranchesService } from './branches.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../common/tenant/tenant-context.decorator';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  BranchDTO,
  CreateBranchRequest,
  UpdateBranchRequest,
  DepartmentDTO,
  CreateDepartmentRequest,
} from '@mcms/contracts';
import { PermissionSlug } from '@mcms/domain';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.BRANCHES_READ)
  async findAll(
    @CurrentUser() user: AuthenticatedUserEntity,
    @CurrentTenant() tenantId: string | null,
  ): Promise<BranchDTO[]> {
    return this.branchesService.findAll(user, tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.BRANCHES_READ)
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<BranchDTO> {
    return this.branchesService.findById(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.BRANCHES_WRITE)
  async create(
    @Body() body: CreateBranchRequest,
    @CurrentUser() user: AuthenticatedUserEntity,
    @CurrentTenant() tenantId: string | null,
  ): Promise<BranchDTO> {
    return this.branchesService.create(body, user, tenantId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.BRANCHES_WRITE)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBranchRequest,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<BranchDTO> {
    return this.branchesService.update(id, body, user);
  }

  @Get(':id/departments')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.BRANCHES_READ)
  async getDepartments(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<DepartmentDTO[]> {
    return this.branchesService.getDepartments(id, user);
  }

  @Post(':id/departments')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.BRANCHES_WRITE)
  async createDepartment(
    @Param('id') id: string,
    @Body() body: CreateDepartmentRequest,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<DepartmentDTO> {
    return this.branchesService.createDepartment(id, body, user);
  }
}
