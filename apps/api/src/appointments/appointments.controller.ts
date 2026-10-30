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
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { TenantCtx } from '../common/tenant/tenant-context.decorator';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type { TenantContext } from '../common/tenant/tenant-context.interface';
import type {
  QueueEntryDTO,
  CreateQueueEntryRequest,
  UpdateQueueEntryRequest,
  AppointmentDTO,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '@mcms/contracts';
import { PermissionSlug } from '@mcms/domain';

@Controller()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ─── Queue ───────────────────────────────────────────────────────────────

  @Get('queue')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.QUEUES_READ)
  async getQueue(@TenantCtx() ctx: TenantContext): Promise<QueueEntryDTO[]> {
    return this.appointmentsService.getQueue(ctx);
  }

  @Post('queue')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.QUEUES_MANAGE)
  async addToQueue(
    @Body() body: CreateQueueEntryRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<QueueEntryDTO> {
    return this.appointmentsService.addToQueue(body, ctx, user);
  }

  @Patch('queue/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.QUEUES_MANAGE)
  async updateQueueEntry(
    @Param('id') id: string,
    @Body() body: UpdateQueueEntryRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<QueueEntryDTO> {
    return this.appointmentsService.updateQueueEntry(id, body, ctx);
  }

  // ─── Appointments ─────────────────────────────────────────────────────────

  @Get('appointments')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.APPOINTMENTS_READ)
  async getAppointments(
    @TenantCtx() ctx: TenantContext,
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
  ): Promise<AppointmentDTO[]> {
    return this.appointmentsService.getAppointments(ctx, date, doctorId, patientId);
  }

  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.APPOINTMENTS_WRITE)
  async createAppointment(
    @Body() body: CreateAppointmentRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<AppointmentDTO> {
    return this.appointmentsService.createAppointment(body, ctx, user);
  }

  @Patch('appointments/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.APPOINTMENTS_WRITE)
  async updateAppointment(
    @Param('id') id: string,
    @Body() body: UpdateAppointmentRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<AppointmentDTO> {
    return this.appointmentsService.updateAppointment(id, body, ctx);
  }
}
