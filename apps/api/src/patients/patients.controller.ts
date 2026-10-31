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
import { PatientsService } from './patients.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { TenantCtx } from '../common/tenant/tenant-context.decorator';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type { TenantContext } from '../common/tenant/tenant-context.interface';
import type { PatientDTO, CreatePatientRequest, UpdatePatientRequest } from '@mcms/contracts';
import { PermissionSlug } from '@mcms/domain';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.PATIENTS_READ)
  async findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.patientsService.findAll(
      ctx,
      user,
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.PATIENTS_READ)
  async findById(
    @Param('id') id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<PatientDTO> {
    return this.patientsService.findById(id, ctx);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.PATIENTS_WRITE)
  async create(
    @Body() body: CreatePatientRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<PatientDTO> {
    return this.patientsService.create(body, ctx, user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.PATIENTS_WRITE)
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePatientRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<PatientDTO> {
    return this.patientsService.update(id, body, ctx, user);
  }
}
