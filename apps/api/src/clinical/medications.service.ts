import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  MedicationAdminDTO,
  CreateMedAdminRequest,
  UpdateMedAdminRequest,
} from '@mcms/contracts';
import { MedAdminStatus } from '@prisma/client';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDTO(m: {
    id: string;
    patientId: string;
    admissionId: string | null;
    medicationName: string;
    dose: string;
    route: string;
    schedule: string;
    scheduledTime: string | null;
    status: string;
    administeredById: string | null;
    administeredAt: Date | null;
    instructions: string | null;
    notes: string | null;
    patient: {
      fullName: string;
    };
    administeredBy?: {
      displayName: string;
    } | null;
  }): MedicationAdminDTO {
    return {
      id: m.id,
      patientId: m.patientId,
      patientName: m.patient.fullName,
      admissionId: m.admissionId,
      medicationName: m.medicationName,
      dose: m.dose,
      route: m.route,
      schedule: m.schedule,
      scheduledTime: m.scheduledTime,
      status: m.status,
      administeredById: m.administeredById,
      administeredByName: m.administeredBy?.displayName ?? null,
      administeredAt: m.administeredAt?.toISOString() ?? null,
      instructions: m.instructions,
      notes: m.notes,
    };
  }

  async getMedAdmins(
    ctx: TenantContext,
    patientId?: string,
    admissionId?: string,
    status?: string,
  ): Promise<MedicationAdminDTO[]> {
    const { tenantId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (patientId) where.patientId = patientId;
    if (admissionId) where.admissionId = admissionId;
    if (status) where.status = status as MedAdminStatus;

    const admins = await this.prisma.medicationAdministration.findMany({
      where: where as any,
      include: {
        patient: { select: { fullName: true } },
        administeredBy: { select: { displayName: true } },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return admins.map((a) => this.mapToDTO(a));
  }

  async createMedAdmin(
    dto: CreateMedAdminRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<MedicationAdminDTO> {
    const tenantId = ctx.tenantId ?? user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient || patient.tenantId !== tenantId) {
      throw new NotFoundException(`Patient ${dto.patientId} not found`);
    }

    const created = await this.prisma.medicationAdministration.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        admissionId: dto.admissionId ?? null,
        medicationName: dto.medicationName,
        dose: dto.dose,
        route: dto.route ?? 'Oral',
        schedule: dto.schedule ?? 'BID',
        scheduledTime: dto.scheduledTime ?? null,
        instructions: dto.instructions ?? null,
        status: MedAdminStatus.PENDING,
      },
      include: {
        patient: { select: { fullName: true } },
        administeredBy: { select: { displayName: true } },
      },
    });

    return this.mapToDTO(created);
  }

  async administerMedication(
    id: string,
    dto: UpdateMedAdminRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<MedicationAdminDTO> {
    const medAdmin = await this.prisma.medicationAdministration.findUnique({
      where: { id },
    });

    if (!medAdmin) {
      throw new NotFoundException(`Medication administration ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && medAdmin.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const administeredAt = dto.administeredAt ? new Date(dto.administeredAt) : new Date();

    const updated = await this.prisma.medicationAdministration.update({
      where: { id },
      data: {
        status: (dto.status as MedAdminStatus) ?? MedAdminStatus.ADMINISTERED,
        administeredById: user.id,
        administeredAt,
        notes: dto.notes ?? medAdmin.notes,
      },
      include: {
        patient: { select: { fullName: true } },
        administeredBy: { select: { displayName: true } },
      },
    });

    return this.mapToDTO(updated);
  }
}
