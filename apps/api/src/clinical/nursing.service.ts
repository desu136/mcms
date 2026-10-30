import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  NursingTaskDTO,
  CreateNursingTaskRequest,
  UpdateNursingTaskRequest,
} from '@mcms/contracts';
import { TaskPriority, TaskStatus } from '@prisma/client';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class NursingService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDTO(t: {
    id: string;
    branchId: string;
    patientId: string;
    admissionId: string | null;
    assignedToId: string | null;
    title: string;
    details: string | null;
    taskType: string;
    priority: string;
    dueTime: string;
    status: string;
    completedAt: Date | null;
    createdAt: Date;
    patient: {
      fullName: string;
    };
    assignedTo?: {
      displayName: string;
    } | null;
  }): NursingTaskDTO {
    return {
      id: t.id,
      branchId: t.branchId,
      patientId: t.patientId,
      patientName: t.patient.fullName,
      admissionId: t.admissionId,
      assignedToId: t.assignedToId,
      assignedToName: t.assignedTo?.displayName ?? null,
      title: t.title,
      details: t.details,
      taskType: t.taskType,
      priority: t.priority,
      dueTime: t.dueTime,
      status: t.status,
      completedAt: t.completedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    };
  }

  async getTasks(
    ctx: TenantContext,
    status?: string,
    assignedToId?: string,
    patientId?: string,
  ): Promise<NursingTaskDTO[]> {
    const { tenantId, branchId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;
    if (status) where.status = status as TaskStatus;
    if (assignedToId) where.assignedToId = assignedToId;
    if (patientId) where.patientId = patientId;

    const tasks = await this.prisma.nursingTask.findMany({
      where: where as any,
      include: {
        patient: { select: { fullName: true } },
        assignedTo: { select: { displayName: true } },
      },
      orderBy: { dueTime: 'asc' },
    });

    return tasks.map((t) => this.mapToDTO(t));
  }

  async getTaskById(id: string, ctx: TenantContext): Promise<NursingTaskDTO> {
    const task = await this.prisma.nursingTask.findUnique({
      where: { id },
      include: {
        patient: { select: { fullName: true } },
        assignedTo: { select: { displayName: true } },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && task.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return this.mapToDTO(task);
  }

  async createTask(
    dto: CreateNursingTaskRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<NursingTaskDTO> {
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
      throw new NotFoundException(`Patient ${dto.patientId} not found`);
    }

    const task = await this.prisma.nursingTask.create({
      data: {
        tenantId,
        branchId,
        patientId: dto.patientId,
        admissionId: dto.admissionId ?? null,
        assignedToId: dto.assignedToId ?? user.id,
        title: dto.title,
        details: dto.details ?? null,
        taskType: dto.taskType ?? 'General',
        priority: (dto.priority as TaskPriority) ?? TaskPriority.MEDIUM,
        dueTime: dto.dueTime,
        status: TaskStatus.PENDING,
      },
      include: {
        patient: { select: { fullName: true } },
        assignedTo: { select: { displayName: true } },
      },
    });

    return this.mapToDTO(task);
  }

  async updateTask(
    id: string,
    dto: UpdateNursingTaskRequest,
    ctx: TenantContext,
  ): Promise<NursingTaskDTO> {
    const task = await this.prisma.nursingTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && task.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.assignedToId !== undefined) updateData.assignedToId = dto.assignedToId;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.details !== undefined) updateData.details = dto.details;
    if (dto.taskType !== undefined) updateData.taskType = dto.taskType;
    if (dto.priority !== undefined) updateData.priority = dto.priority as TaskPriority;
    if (dto.dueTime !== undefined) updateData.dueTime = dto.dueTime;
    if (dto.status !== undefined) {
      updateData.status = dto.status as TaskStatus;
      if (dto.status === TaskStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    const updated = await this.prisma.nursingTask.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { fullName: true } },
        assignedTo: { select: { displayName: true } },
      },
    });

    return this.mapToDTO(updated);
  }
}
