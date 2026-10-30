import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  LabOrderDTO,
  CreateLabOrderRequest,
  UpdateLabOrderRequest,
  RecordLabResultRequest,
  CollectSampleRequest,
} from '@mcms/contracts';
import {
  LabOrderPriority,
  LabOrderStatus,
  LabSampleStatus,
} from '@prisma/client';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class LabsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDTO(o: {
    id: string;
    tenantId: string;
    branchId: string;
    patientId: string;
    orderingDoctorId: string;
    orderNumber: string;
    priority: string;
    status: string;
    clinicalNotes: string | null;
    orderedAt: Date;
    patient: {
      fullName: string;
      pid: string;
    };
    orderingDoctor: {
      displayName: string;
    };
    samples: Array<{
      id: string;
      sampleId: string;
      sampleType: string;
      tubeType: string | null;
      status: string;
      collectedAt: Date | null;
      receivedAt: Date | null;
    }>;
    results: Array<{
      id: string;
      testName: string;
      testCategory: string | null;
      value: string;
      unit: string | null;
      referenceRange: string | null;
      isAbnormal: boolean;
      performedAt: Date;
      verifiedAt: Date | null;
      notes: string | null;
    }>;
  }): LabOrderDTO {
    return {
      id: o.id,
      tenantId: o.tenantId,
      branchId: o.branchId,
      patientId: o.patientId,
      patientName: o.patient.fullName,
      patientPid: o.patient.pid,
      orderingDoctorId: o.orderingDoctorId,
      orderingDoctorName: o.orderingDoctor.displayName,
      orderNumber: o.orderNumber,
      priority: o.priority,
      status: o.status,
      clinicalNotes: o.clinicalNotes,
      orderedAt: o.orderedAt.toISOString(),
      samples: o.samples.map((s) => ({
        id: s.id,
        sampleId: s.sampleId,
        sampleType: s.sampleType,
        tubeType: s.tubeType,
        status: s.status,
        collectedAt: s.collectedAt?.toISOString() ?? null,
        receivedAt: s.receivedAt?.toISOString() ?? null,
      })),
      results: o.results.map((r) => ({
        id: r.id,
        testName: r.testName,
        testCategory: r.testCategory,
        value: r.value,
        unit: r.unit,
        referenceRange: r.referenceRange,
        isAbnormal: r.isAbnormal,
        performedAt: r.performedAt.toISOString(),
        verifiedAt: r.verifiedAt?.toISOString() ?? null,
        notes: r.notes,
      })),
    };
  }

  async getLabOrders(
    ctx: TenantContext,
    patientId?: string,
    status?: string,
  ): Promise<LabOrderDTO[]> {
    const { tenantId, branchId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status as LabOrderStatus;

    const orders = await this.prisma.labOrder.findMany({
      where: where as any,
      include: {
        patient: { select: { fullName: true, pid: true } },
        orderingDoctor: { select: { displayName: true } },
        samples: true,
        results: true,
      },
      orderBy: { orderedAt: 'desc' },
    });

    return orders.map((o) => this.mapToDTO(o));
  }

  async getLabOrderById(id: string, ctx: TenantContext): Promise<LabOrderDTO> {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: { select: { fullName: true, pid: true } },
        orderingDoctor: { select: { displayName: true } },
        samples: true,
        results: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Lab order ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && order.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return this.mapToDTO(order);
  }

  async createLabOrder(
    dto: CreateLabOrderRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    const tenantId = ctx.tenantId ?? user.tenantId;
    const branchId =
      ctx.branchId ??
      user.userBranches.find((b) => b.isPrimary)?.branchId ??
      user.userBranches[0]?.branchId;

    if (!tenantId || !branchId) {
      throw new BadRequestException('Tenant and branch context required');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient || patient.tenantId !== tenantId) {
      throw new NotFoundException(`Patient ${dto.patientId} not found in this tenant`);
    }

    const count = await this.prisma.labOrder.count({ where: { tenantId } });
    const orderNumber = `LAB-${String(count + 1).padStart(6, '0')}`;

    // Create unique samples based on sampleType
    const uniqueSampleTypes = Array.from(
      new Set(dto.tests.map((t) => `${t.sampleType}|${t.tubeType ?? ''}`)),
    );

    const sampleCreates = uniqueSampleTypes.map((st, idx) => {
      const [sampleType, tubeType] = st.split('|');
      return {
        sampleId: `SMP-${Date.now().toString().slice(-5)}${idx + 1}`,
        sampleType: sampleType ?? 'Blood',
        tubeType: tubeType ? tubeType : null,
        status: LabSampleStatus.PENDING,
      };
    });

    const order = await this.prisma.labOrder.create({
      data: {
        tenantId,
        branchId,
        patientId: dto.patientId,
        orderingDoctorId: user.id,
        orderNumber,
        priority: (dto.priority as LabOrderPriority) ?? LabOrderPriority.ROUTINE,
        status: LabOrderStatus.ORDERED,
        clinicalNotes: dto.clinicalNotes ?? null,
        samples: {
          create: sampleCreates,
        },
      },
      include: {
        patient: { select: { fullName: true, pid: true } },
        orderingDoctor: { select: { displayName: true } },
        samples: true,
        results: true,
      },
    });

    return this.mapToDTO(order);
  }

  async collectSample(
    labOrderId: string,
    sampleId: string,
    dto: CollectSampleRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    const order = await this.prisma.labOrder.findUnique({
      where: { id: labOrderId },
      include: { samples: true },
    });

    if (!order) {
      throw new NotFoundException(`Lab order ${labOrderId} not found`);
    }

    const targetSample = order.samples.find((s) => s.id === sampleId || s.sampleId === sampleId);
    if (!targetSample) {
      throw new NotFoundException(`Sample ${sampleId} not found in lab order`);
    }

    await this.prisma.labSample.update({
      where: { id: targetSample.id },
      data: {
        status: LabSampleStatus.COLLECTED,
        collectedById: user.id,
        collectedAt: new Date(),
      },
    });

    // Check if all samples are collected
    const remainingPending = order.samples.filter(
      (s) => s.id !== targetSample.id && s.status === LabSampleStatus.PENDING,
    );

    if (remainingPending.length === 0) {
      await this.prisma.labOrder.update({
        where: { id: labOrderId },
        data: { status: LabOrderStatus.SAMPLE_COLLECTED },
      });
    }

    return this.getLabOrderById(labOrderId, ctx);
  }

  async recordResult(
    labOrderId: string,
    dto: RecordLabResultRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    const order = await this.prisma.labOrder.findUnique({
      where: { id: labOrderId },
    });

    if (!order) {
      throw new NotFoundException(`Lab order ${labOrderId} not found`);
    }

    await this.prisma.labResult.create({
      data: {
        labOrderId,
        testName: dto.testName,
        testCategory: dto.testCategory ?? null,
        value: dto.value,
        unit: dto.unit ?? null,
        referenceRange: dto.referenceRange ?? null,
        isAbnormal: dto.isAbnormal ?? false,
        performedById: user.id,
        notes: dto.notes ?? null,
      },
    });

    await this.prisma.labOrder.update({
      where: { id: labOrderId },
      data: { status: LabOrderStatus.RESULTED },
    });

    return this.getLabOrderById(labOrderId, ctx);
  }

  async verifyResult(
    labOrderId: string,
    resultId: string,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<LabOrderDTO> {
    const result = await this.prisma.labResult.findUnique({
      where: { id: resultId },
    });

    if (!result || result.labOrderId !== labOrderId) {
      throw new NotFoundException(`Result ${resultId} not found for lab order ${labOrderId}`);
    }

    await this.prisma.labResult.update({
      where: { id: resultId },
      data: {
        verifiedById: user.id,
        verifiedAt: new Date(),
      },
    });

    // Check if all results are verified
    const allResults = await this.prisma.labResult.findMany({
      where: { labOrderId },
    });

    const unverified = allResults.filter((r) => !r.verifiedAt);
    if (unverified.length === 0) {
      await this.prisma.labOrder.update({
        where: { id: labOrderId },
        data: { status: LabOrderStatus.VERIFIED },
      });
    }

    return this.getLabOrderById(labOrderId, ctx);
  }
}
