import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  AdmissionDTO,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
} from '@mcms/contracts';
import { AdmissionStatus, BedStatus } from '@prisma/client';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDTO(admission: {
    id: string;
    tenantId: string;
    branchId: string;
    patientId: string;
    bedId: string;
    admittingDoctorId: string | null;
    admissionDate: Date;
    dischargeDate: Date | null;
    status: string;
    admissionDiagnosis: string | null;
    dischargeSummary: string | null;
    patient: {
      fullName: string;
      pid: string;
    };
    admittingDoctor?: {
      displayName: string;
    } | null;
  }): AdmissionDTO {
    return {
      id: admission.id,
      tenantId: admission.tenantId,
      branchId: admission.branchId,
      patientId: admission.patientId,
      patientName: admission.patient.fullName,
      patientPid: admission.patient.pid,
      bedId: admission.bedId,
      admittingDoctorId: admission.admittingDoctorId,
      admittingDoctorName: admission.admittingDoctor?.displayName ?? null,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: admission.dischargeDate?.toISOString() ?? null,
      status: admission.status,
      admissionDiagnosis: admission.admissionDiagnosis,
      dischargeSummary: admission.dischargeSummary,
    };
  }

  async getAdmissions(
    ctx: TenantContext,
    patientId?: string,
    status?: string,
  ): Promise<AdmissionDTO[]> {
    const { tenantId, branchId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status as AdmissionStatus;

    const admissions = await this.prisma.admission.findMany({
      where: where as any,
      include: {
        patient: { select: { fullName: true, pid: true } },
        admittingDoctor: { select: { displayName: true } },
      },
      orderBy: { admissionDate: 'desc' },
    });

    return admissions.map((a) => this.mapToDTO(a));
  }

  async getAdmissionById(id: string, ctx: TenantContext): Promise<AdmissionDTO> {
    const admission = await this.prisma.admission.findUnique({
      where: { id },
      include: {
        patient: { select: { fullName: true, pid: true } },
        admittingDoctor: { select: { displayName: true } },
      },
    });

    if (!admission) {
      throw new NotFoundException(`Admission ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && admission.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied to this admission');
    }

    return this.mapToDTO(admission);
  }

  async createAdmission(
    dto: CreateAdmissionRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<AdmissionDTO> {
    const tenantId = ctx.tenantId ?? user.tenantId;
    const branchId =
      ctx.branchId ??
      user.userBranches.find((b) => b.isPrimary)?.branchId ??
      user.userBranches[0]?.branchId;

    if (!tenantId || !branchId) {
      throw new BadRequestException('Tenant and branch context are required for admissions');
    }

    // Check patient
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient || patient.tenantId !== tenantId) {
      throw new NotFoundException(`Patient ${dto.patientId} not found in this tenant`);
    }

    // Check bed exists and is AVAILABLE
    const bed = await this.prisma.bed.findUnique({
      where: { id: dto.bedId },
      include: { room: true },
    });
    if (!bed || bed.room.branchId !== branchId) {
      throw new NotFoundException(`Bed ${dto.bedId} not found in this branch`);
    }
    if (bed.status !== BedStatus.AVAILABLE) {
      throw new BadRequestException(`Bed ${dto.bedId} is not available (current status: ${bed.status})`);
    }

    // Create admission and mark bed OCCUPIED in transaction
    const [admission] = await this.prisma.$transaction([
      this.prisma.admission.create({
        data: {
          tenantId,
          branchId,
          patientId: dto.patientId,
          bedId: dto.bedId,
          admittingDoctorId: dto.admittingDoctorId ?? user.id,
          admissionDiagnosis: dto.admissionDiagnosis ?? null,
          status: AdmissionStatus.ADMITTED,
        },
        include: {
          patient: { select: { fullName: true, pid: true } },
          admittingDoctor: { select: { displayName: true } },
        },
      }),
      this.prisma.bed.update({
        where: { id: dto.bedId },
        data: { status: BedStatus.OCCUPIED },
      }),
    ]);

    return this.mapToDTO(admission);
  }

  async dischargePatient(
    id: string,
    dto: UpdateAdmissionRequest,
    ctx: TenantContext,
  ): Promise<AdmissionDTO> {
    const admission = await this.prisma.admission.findUnique({
      where: { id },
      include: {
        patient: { select: { fullName: true, pid: true } },
        admittingDoctor: { select: { displayName: true } },
      },
    });

    if (!admission) {
      throw new NotFoundException(`Admission ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && admission.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const dischargeDate = dto.dischargeDate ? new Date(dto.dischargeDate) : new Date();

    const [updated] = await this.prisma.$transaction([
      this.prisma.admission.update({
        where: { id },
        data: {
          status: AdmissionStatus.DISCHARGED,
          dischargeDate,
          dischargeSummary: dto.dischargeSummary ?? admission.dischargeSummary,
        },
        include: {
          patient: { select: { fullName: true, pid: true } },
          admittingDoctor: { select: { displayName: true } },
        },
      }),
      this.prisma.bed.update({
        where: { id: admission.bedId },
        data: { status: BedStatus.AVAILABLE },
      }),
    ]);

    return this.mapToDTO(updated);
  }

  async getAvailableBeds(ctx: TenantContext, roomId?: string) {
    const { branchId } = ctx;
    const where: Record<string, unknown> = {
      status: BedStatus.AVAILABLE,
    };

    if (roomId) {
      where.roomId = roomId;
    } else if (branchId) {
      where.room = { branchId };
    }

    return this.prisma.bed.findMany({
      where: where as any,
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            name: true,
            roomType: true,
          },
        },
      },
      orderBy: { bedNumber: 'asc' },
    });
  }
}
