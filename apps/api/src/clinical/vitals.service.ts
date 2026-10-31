import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  VitalReadingDTO,
  CreateVitalReadingRequest,
} from '@mcms/contracts';
import { VitalsCondition } from '@prisma/client';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class VitalsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateCondition(
    systolic: number,
    diastolic: number,
    spo2: number,
    temperature: number,
  ): VitalsCondition {
    if (systolic >= 180 || diastolic >= 120 || spo2 < 90 || temperature >= 39.5) {
      return VitalsCondition.CRITICAL;
    }
    if (systolic >= 140 || diastolic >= 90) {
      return VitalsCondition.HIGH_BP;
    }
    if (systolic < 90 || diastolic < 60) {
      return VitalsCondition.LOW_BP;
    }
    if (systolic >= 120 && systolic <= 139) {
      return VitalsCondition.ELEVATED;
    }
    return VitalsCondition.NORMAL;
  }

  private mapToDTO(v: {
    id: string;
    tenantId: string;
    patientId: string;
    admissionId: string | null;
    recordedById: string | null;
    systolicBp: number;
    diastolicBp: number;
    heartRate: number;
    temperature: number;
    spo2: number;
    respiratoryRate: number | null;
    condition: string;
    notes: string | null;
    recordedAt: Date;
    recordedBy?: {
      displayName: string;
    } | null;
  }): VitalReadingDTO {
    return {
      id: v.id,
      tenantId: v.tenantId,
      patientId: v.patientId,
      admissionId: v.admissionId,
      recordedById: v.recordedById,
      recordedByName: v.recordedBy?.displayName ?? null,
      systolicBp: v.systolicBp,
      diastolicBp: v.diastolicBp,
      heartRate: v.heartRate,
      temperature: v.temperature,
      spo2: v.spo2,
      respiratoryRate: v.respiratoryRate,
      condition: v.condition,
      notes: v.notes,
      recordedAt: v.recordedAt.toISOString(),
    };
  }

  async getPatientVitals(
    patientId: string,
    ctx: TenantContext,
    limit = 20,
  ): Promise<VitalReadingDTO[]> {
    const { tenantId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient ${patientId} not found`);
    }

    if (!isSuperAdmin && tenantId && patient.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to patient');
    }

    const readings = await this.prisma.vitalReading.findMany({
      where: { patientId },
      include: {
        recordedBy: { select: { displayName: true } },
      },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });

    return readings.map((r) => this.mapToDTO(r));
  }

  async recordVitals(
    dto: CreateVitalReadingRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<VitalReadingDTO> {
    const tenantId = ctx.tenantId ?? user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required to record vitals');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient || patient.tenantId !== tenantId) {
      throw new NotFoundException(`Patient ${dto.patientId} not found in this tenant`);
    }

    const condition = this.calculateCondition(
      dto.systolicBp,
      dto.diastolicBp,
      dto.spo2,
      dto.temperature,
    );

    const vitalReading = await this.prisma.vitalReading.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        admissionId: dto.admissionId ?? null,
        recordedById: user.id,
        systolicBp: dto.systolicBp,
        diastolicBp: dto.diastolicBp,
        heartRate: dto.heartRate,
        temperature: dto.temperature,
        spo2: dto.spo2,
        respiratoryRate: dto.respiratoryRate ?? 16,
        condition,
        notes: dto.notes ?? null,
      },
      include: {
        recordedBy: { select: { displayName: true } },
      },
    });

    return this.mapToDTO(vitalReading);
  }
}
