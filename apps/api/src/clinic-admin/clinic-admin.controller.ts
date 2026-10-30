import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClinicAdminService } from './clinic-admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { TenantCtx } from '../common/tenant/tenant-context.decorator';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type { TenantContext } from '../common/tenant/tenant-context.interface';
import { PermissionSlug } from '@mcms/domain';
import type {
  ClinicDashboardStatsDTO,
  DoctorDTO,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  ClinicDepartmentDTO,
  CreateClinicDepartmentRequest,
  ClinicRoomDTO,
  CreateClinicRoomRequest,
} from '@mcms/contracts';

@Controller('clinic-admin')
export class ClinicAdminController {
  constructor(private readonly clinicAdminService: ClinicAdminService) {}

  // ─── Dashboard Stats ────────────────────────────────────────────────────────

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.BRANCHES_READ)
  async getDashboardStats(
    @TenantCtx() ctx: TenantContext,
  ): Promise<ClinicDashboardStatsDTO> {
    return this.clinicAdminService.getDashboardStats(ctx);
  }

  // ─── Doctors ────────────────────────────────────────────────────────────────

  @Get('doctors')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.USERS_READ)
  async getDoctors(
    @TenantCtx() ctx: TenantContext,
  ): Promise<DoctorDTO[]> {
    return this.clinicAdminService.getDoctors(ctx);
  }

  @Post('doctors')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.USERS_CREATE)
  async createDoctor(
    @Body() body: CreateDoctorRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() actor: AuthenticatedUserEntity,
  ): Promise<DoctorDTO> {
    return this.clinicAdminService.createDoctor(body, ctx, actor);
  }

  @Patch('doctors/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.USERS_UPDATE)
  async updateDoctor(
    @Param('id') id: string,
    @Body() body: UpdateDoctorRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<DoctorDTO> {
    return this.clinicAdminService.updateDoctor(id, body, ctx);
  }

  // ─── Departments ────────────────────────────────────────────────────────────

  @Get('departments')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.DEPARTMENTS_READ)
  async getDepartments(
    @TenantCtx() ctx: TenantContext,
  ): Promise<ClinicDepartmentDTO[]> {
    return this.clinicAdminService.getDepartments(ctx);
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.DEPARTMENTS_MANAGE)
  async createDepartment(
    @Body() body: CreateClinicDepartmentRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ClinicDepartmentDTO> {
    return this.clinicAdminService.createDepartment(body, ctx);
  }

  // ─── Rooms ──────────────────────────────────────────────────────────────────

  @Get('rooms')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.ROOMS_READ)
  async getRooms(
    @TenantCtx() ctx: TenantContext,
    @Query('departmentId') departmentId?: string,
  ): Promise<ClinicRoomDTO[]> {
    return this.clinicAdminService.getRooms(ctx, departmentId);
  }

  @Post('rooms')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.ROOMS_MANAGE)
  async createRoom(
    @Body() body: CreateClinicRoomRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ClinicRoomDTO> {
    return this.clinicAdminService.createRoom(body, ctx);
  }
}
