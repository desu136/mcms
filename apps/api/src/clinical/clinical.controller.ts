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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { TenantCtx } from '../common/tenant/tenant-context.decorator';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type { TenantContext } from '../common/tenant/tenant-context.interface';
import { PermissionSlug } from '@mcms/domain';

import { AdmissionsService } from './admissions.service';
import { VitalsService } from './vitals.service';
import { PrescriptionsService } from './prescriptions.service';
import { MedicationsService } from './medications.service';
import { NursingService } from './nursing.service';
import { LabsService } from './labs.service';

import type {
  AdmissionDTO,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
  VitalReadingDTO,
  CreateVitalReadingRequest,
  PrescriptionDTO,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
  MedicationAdminDTO,
  CreateMedAdminRequest,
  UpdateMedAdminRequest,
  NursingTaskDTO,
  CreateNursingTaskRequest,
  UpdateNursingTaskRequest,
  LabOrderDTO,
  CreateLabOrderRequest,
  RecordLabResultRequest,
  CollectSampleRequest,
} from '@mcms/contracts';

@Controller()
export class ClinicalController {
  constructor(
    private readonly admissionsService: AdmissionsService,
    private readonly vitalsService: VitalsService,
    private readonly prescriptionsService: PrescriptionsService,
    private readonly medicationsService: MedicationsService,
    private readonly nursingService: NursingService,
    private readonly labsService: LabsService,
  ) {}

  // ─── Admissions ─────────────────────────────────────────────────────────────

  @Get('admissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.ADMISSIONS_READ)
  async getAdmissions(
    @TenantCtx() ctx: TenantContext,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ): Promise<AdmissionDTO[]> {
    return this.admissionsService.getAdmissions(ctx, patientId, status);
  }

  @Get('admissions/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.ADMISSIONS_READ)
  async getAdmissionById(
    @Param('id') id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<AdmissionDTO> {
    return this.admissionsService.getAdmissionById(id, ctx);
  }

  @Post('admissions')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.ADMISSIONS_WRITE)
  async createAdmission(
    @Body() body: CreateAdmissionRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<AdmissionDTO> {
    return this.admissionsService.createAdmission(body, ctx, user);
  }

  @Patch('admissions/:id/discharge')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.ADMISSIONS_WRITE)
  async dischargePatient(
    @Param('id') id: string,
    @Body() body: UpdateAdmissionRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<AdmissionDTO> {
    return this.admissionsService.dischargePatient(id, body, ctx);
  }

  @Get('beds/available')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.ADMISSIONS_READ)
  async getAvailableBeds(
    @TenantCtx() ctx: TenantContext,
    @Query('roomId') roomId?: string,
  ) {
    return this.admissionsService.getAvailableBeds(ctx, roomId);
  }

  // ─── Vitals ─────────────────────────────────────────────────────────────────

  @Get('patients/:patientId/vitals')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.VITALS_READ)
  async getPatientVitals(
    @Param('patientId') patientId: string,
    @TenantCtx() ctx: TenantContext,
    @Query('limit') limit?: string,
  ): Promise<VitalReadingDTO[]> {
    return this.vitalsService.getPatientVitals(
      patientId,
      ctx,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('vitals')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.VITALS_RECORD)
  async recordVitals(
    @Body() body: CreateVitalReadingRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<VitalReadingDTO> {
    return this.vitalsService.recordVitals(body, ctx, user);
  }

  // ─── Prescriptions ──────────────────────────────────────────────────────────

  @Get('prescriptions')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.PRESCRIPTIONS_READ)
  async getPrescriptions(
    @TenantCtx() ctx: TenantContext,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ): Promise<PrescriptionDTO[]> {
    return this.prescriptionsService.getPrescriptions(ctx, patientId, status);
  }

  @Get('prescriptions/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.PRESCRIPTIONS_READ)
  async getPrescriptionById(
    @Param('id') id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<PrescriptionDTO> {
    return this.prescriptionsService.getPrescriptionById(id, ctx);
  }

  @Post('prescriptions')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.PRESCRIPTIONS_WRITE)
  async createPrescription(
    @Body() body: CreatePrescriptionRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<PrescriptionDTO> {
    return this.prescriptionsService.createPrescription(body, ctx, user);
  }

  @Patch('prescriptions/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.PRESCRIPTIONS_WRITE)
  async updatePrescription(
    @Param('id') id: string,
    @Body() body: UpdatePrescriptionRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<PrescriptionDTO> {
    return this.prescriptionsService.updatePrescription(id, body, ctx);
  }

  // ─── Medications / eMAR ─────────────────────────────────────────────────────

  @Get('medications')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.NURSING_READ)
  async getMedAdmins(
    @TenantCtx() ctx: TenantContext,
    @Query('patientId') patientId?: string,
    @Query('admissionId') admissionId?: string,
    @Query('status') status?: string,
  ): Promise<MedicationAdminDTO[]> {
    return this.medicationsService.getMedAdmins(ctx, patientId, admissionId, status);
  }

  @Post('medications')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.NURSING_TASKS)
  async createMedAdmin(
    @Body() body: CreateMedAdminRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<MedicationAdminDTO> {
    return this.medicationsService.createMedAdmin(body, ctx, user);
  }

  @Patch('medications/:id/administer')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.MEDICATIONS_ADMINISTER)
  async administerMedication(
    @Param('id') id: string,
    @Body() body: UpdateMedAdminRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<MedicationAdminDTO> {
    return this.medicationsService.administerMedication(id, body, ctx, user);
  }

  // ─── Nursing Tasks ──────────────────────────────────────────────────────────

  @Get('nursing-tasks')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.NURSING_READ)
  async getTasks(
    @TenantCtx() ctx: TenantContext,
    @Query('status') status?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('patientId') patientId?: string,
  ): Promise<NursingTaskDTO[]> {
    return this.nursingService.getTasks(ctx, status, assignedToId, patientId);
  }

  @Get('nursing-tasks/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.NURSING_READ)
  async getTaskById(
    @Param('id') id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<NursingTaskDTO> {
    return this.nursingService.getTaskById(id, ctx);
  }

  @Post('nursing-tasks')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.NURSING_TASKS)
  async createTask(
    @Body() body: CreateNursingTaskRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<NursingTaskDTO> {
    return this.nursingService.createTask(body, ctx, user);
  }

  @Patch('nursing-tasks/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.NURSING_TASKS)
  async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateNursingTaskRequest,
    @TenantCtx() ctx: TenantContext,
  ): Promise<NursingTaskDTO> {
    return this.nursingService.updateTask(id, body, ctx);
  }

  // ─── Lab Orders ─────────────────────────────────────────────────────────────

  @Get('lab-orders')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.LABS_READ)
  async getLabOrders(
    @TenantCtx() ctx: TenantContext,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ): Promise<LabOrderDTO[]> {
    return this.labsService.getLabOrders(ctx, patientId, status);
  }

  @Get('lab-orders/:id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.LABS_READ)
  async getLabOrderById(
    @Param('id') id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<LabOrderDTO> {
    return this.labsService.getLabOrderById(id, ctx);
  }

  @Post('lab-orders')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.LABS_ORDER)
  async createLabOrder(
    @Body() body: CreateLabOrderRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    return this.labsService.createLabOrder(body, ctx, user);
  }

  @Post('lab-orders/:id/samples/:sampleId/collect')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.LABS_COLLECT)
  async collectSample(
    @Param('id') id: string,
    @Param('sampleId') sampleId: string,
    @Body() body: CollectSampleRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    return this.labsService.collectSample(id, sampleId, body, ctx, user);
  }

  @Post('lab-orders/:id/results')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.LABS_PROCESS)
  async recordResult(
    @Param('id') id: string,
    @Body() body: RecordLabResultRequest,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    return this.labsService.recordResult(id, body, ctx, user);
  }

  @Patch('lab-orders/:id/results/:resultId/verify')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.LABS_VERIFY)
  async verifyResult(
    @Param('id') id: string,
    @Param('resultId') resultId: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    return this.labsService.verifyResult(id, resultId, ctx, user);
  }
}
