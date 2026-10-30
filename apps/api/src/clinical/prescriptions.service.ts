import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  PrescriptionDTO,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
} from '@mcms/contracts';
import { PrescriptionStatus } from '@prisma/client';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDTO(p: {
    id: string;
    tenantId: string;
    branchId: string;
    patientId: string;
    doctorId: string;
    diagnosis: string | null;
    status: string;
    notes: string | null;
    createdAt: Date;
    patient: {
      fullName: string;
      pid: string;
    };
    doctor: {
      displayName: string;
    };
    items: Array<{
      id: string;
      medicationName: string;
      dosage: string;
      route: string;
      frequency: string;
      duration: string;
      instructions: string | null;
    }>;
  }): PrescriptionDTO {
    return {
      id: p.id,
      tenantId: p.tenantId,
      branchId: p.branchId,
      patientId: p.patientId,
      patientName: p.patient.fullName,
      patientPid: p.patient.pid,
      doctorId: p.doctorId,
      doctorName: p.doctor.displayName,
      diagnosis: p.diagnosis,
      status: p.status,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      items: p.items.map((item) => ({
        id: item.id,
        medicationName: item.medicationName,
        dosage: item.dosage,
        route: item.route,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      })),
    };
  }

  async getPrescriptions(
    ctx: TenantContext,
    patientId?: string,
    status?: string,
  ): Promise<PrescriptionDTO[]> {
    const { tenantId, branchId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status as PrescriptionStatus;

    const prescriptions = await this.prisma.prescription.findMany({
      where: where as any,
      include: {
        patient: { select: { fullName: true, pid: true } },
        doctor: { select: { displayName: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prescriptions.map((p) => this.mapToDTO(p));
  }

  async getPrescriptionById(id: string, ctx: TenantContext): Promise<PrescriptionDTO> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: { select: { fullName: true, pid: true } },
        doctor: { select: { displayName: true } },
        items: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && prescription.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied to this prescription');
    }

    return this.mapToDTO(prescription);
  }

  async createPrescription(
    dto: CreatePrescriptionRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<PrescriptionDTO> {
    const tenantId = ctx.tenantId ?? user.tenantId;
    const branchId =
      ctx.branchId ??
      user.userBranches.find((b) => b.isPrimary)?.branchId ??
      user.userBranches[0]?.branchId;

    if (!tenantId || !branchId) {
      throw new BadRequestException('Tenant and branch context are required for prescriptions');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient || patient.tenantId !== tenantId) {
      throw new NotFoundException(`Patient ${dto.patientId} not found in this tenant`);
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Prescription must have at least one medication item');
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        tenantId,
        branchId,
        patientId: dto.patientId,
        doctorId: user.id,
        diagnosis: dto.diagnosis ?? null,
        notes: dto.notes ?? null,
        status: PrescriptionStatus.ACTIVE,
        items: {
          create: dto.items.map((item) => ({
            medicationName: item.medicationName,
            dosage: item.dosage,
            route: item.route ?? 'Oral',
            frequency: item.frequency ?? 'BID',
            duration: item.duration ?? '5 days',
            instructions: item.instructions ?? null,
          })),
        },
      },
      include: {
        patient: { select: { fullName: true, pid: true } },
        doctor: { select: { displayName: true } },
        items: true,
      },
    });

    return this.mapToDTO(prescription);
  }

  async updatePrescription(
    id: string,
    dto: UpdatePrescriptionRequest,
    ctx: TenantContext,
  ): Promise<PrescriptionDTO> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && prescription.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.status) updateData.status = dto.status as PrescriptionStatus;
    if (dto.diagnosis !== undefined) updateData.diagnosis = dto.diagnosis;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { fullName: true, pid: true } },
        doctor: { select: { displayName: true } },
        items: true,
      },
    });

    return this.mapToDTO(updated);
  }
}
