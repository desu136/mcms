import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  QueueEntryDTO,
  CreateQueueEntryRequest,
  UpdateQueueEntryRequest,
  AppointmentDTO,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '@mcms/contracts';
import { QueueStatus, QueuePriority, AppointmentType, AppointmentStatus } from '@prisma/client';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeQueuePriority(priority?: string | null): QueuePriority {
    if (!priority) return QueuePriority.ROUTINE;
    const upper = priority.trim().toUpperCase();
    if (upper === 'EMERGENCY' || upper === 'HIGH' || upper === 'CRITICAL') return QueuePriority.EMERGENCY;
    if (upper === 'URGENT' || upper === 'MEDIUM') return QueuePriority.URGENT;
    return QueuePriority.ROUTINE;
  }

  private normalizeQueueStatus(status?: string | null): QueueStatus {
    if (!status) return QueueStatus.WAITING;
    const upper = status.trim().toUpperCase().replace(/\s+/g, '_');
    if (upper === 'IN_CONSULTATION' || upper === 'IN_PROGRESS' || upper === 'CONSULTATION') return QueueStatus.IN_CONSULTATION;
    if (upper === 'CALLED') return QueueStatus.CALLED;
    if (upper === 'COMPLETED' || upper === 'DONE' || upper === 'FINISHED') return QueueStatus.COMPLETED;
    if (upper === 'CANCELLED') return QueueStatus.CANCELLED;
    if (upper === 'NO_SHOW') return QueueStatus.NO_SHOW;
    return QueueStatus.WAITING;
  }

  private normalizeAppointmentType(type?: string | null): AppointmentType {
    if (!type) return AppointmentType.CONSULTATION;
    const upper = type.trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
    if (upper.includes('FOLLOW')) return AppointmentType.FOLLOW_UP;
    if (upper.includes('CHECK') || upper.includes('ROUTINE')) return AppointmentType.ROUTINE_CHECKUP;
    if (upper.includes('PROCEDURE') || upper.includes('SURGERY')) return AppointmentType.PROCEDURE;
    if (upper.includes('OUTPATIENT')) return AppointmentType.OUTPATIENT;
    return AppointmentType.CONSULTATION;
  }

  private normalizeAppointmentStatus(status?: string | null): AppointmentStatus {
    if (!status) return AppointmentStatus.SCHEDULED;
    const upper = status.trim().toUpperCase().replace(/\s+/g, '_');
    if (upper === 'CONFIRMED') return AppointmentStatus.CONFIRMED;
    if (upper === 'CHECKED_IN' || upper === 'CHECK_IN') return AppointmentStatus.CHECKED_IN;
    if (upper === 'IN_PROGRESS' || upper === 'IN_CONSULTATION') return AppointmentStatus.IN_PROGRESS;
    if (upper === 'COMPLETED') return AppointmentStatus.COMPLETED;
    if (upper === 'CANCELLED') return AppointmentStatus.CANCELLED;
    if (upper === 'NO_SHOW') return AppointmentStatus.NO_SHOW;
    return AppointmentStatus.SCHEDULED;
  }

  // ─── Queue ────────────────────────────────────────────────────────────────

  private generateTicket(count: number): string {
    return `T${String(count + 1).padStart(3, '0')}`;
  }

  async getQueue(ctx: TenantContext): Promise<QueueEntryDTO[]> {
    const { tenantId, branchId, isSuperAdmin } = ctx;
    if (!branchId && !isSuperAdmin) {
      throw new ForbiddenException('Branch context required for queue operations');
    }

    const where: Record<string, unknown> = {};
    if (branchId) where.branchId = branchId;
    else if (tenantId) where.tenantId = tenantId;

    const entries = await this.prisma.queueEntry.findMany({
      where: where as any,
      include: {
        patient: { select: { fullName: true, pid: true } },
      },
      orderBy: [{ priority: 'asc' }, { checkInTime: 'asc' }],
    });

    return entries.map((e) => ({
      id: e.id,
      tenantId: e.tenantId,
      branchId: e.branchId,
      patientId: e.patientId,
      patientName: e.patient.fullName,
      patientPid: e.patient.pid,
      departmentId: e.departmentId,
      roomId: e.roomId,
      assignedDoctorId: e.assignedDoctorId,
      ticketNumber: e.ticketNumber,
      priority: e.priority,
      status: e.status,
      checkInTime: e.checkInTime.toISOString(),
      calledTime: e.calledTime?.toISOString() ?? null,
      completedTime: e.completedTime?.toISOString() ?? null,
    }));
  }

  async addToQueue(
    dto: CreateQueueEntryRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<QueueEntryDTO> {
    const { tenantId, branchId } = ctx;
    if (!tenantId || !branchId) {
      throw new ForbiddenException('Tenant and Branch context required to add patient to queue');
    }

    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found in this organization');

    // Count today's queue entries for ticket numbering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.prisma.queueEntry.count({
      where: { branchId, checkInTime: { gte: today } },
    });

    const entry = await this.prisma.queueEntry.create({
      data: {
        tenantId,
        branchId,
        patientId: dto.patientId,
        ticketNumber: this.generateTicket(count),
        priority: this.normalizeQueuePriority(dto.priority),
        status: QueueStatus.WAITING,
        ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
        ...(dto.roomId ? { roomId: dto.roomId } : {}),
        ...(dto.assignedDoctorId ? { assignedDoctorId: dto.assignedDoctorId } : {}),
      },
      include: {
        patient: { select: { fullName: true, pid: true } },
      },
    });

    return {
      id: entry.id,
      tenantId: entry.tenantId,
      branchId: entry.branchId,
      patientId: entry.patientId,
      patientName: entry.patient.fullName,
      patientPid: entry.patient.pid,
      departmentId: entry.departmentId,
      roomId: entry.roomId,
      assignedDoctorId: entry.assignedDoctorId,
      ticketNumber: entry.ticketNumber,
      priority: entry.priority,
      status: entry.status,
      checkInTime: entry.checkInTime.toISOString(),
      calledTime: null,
      completedTime: null,
    };
  }

  async updateQueueEntry(
    id: string,
    dto: UpdateQueueEntryRequest,
    ctx: TenantContext,
  ): Promise<QueueEntryDTO> {
    const entry = await this.prisma.queueEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Queue entry ${id} not found`);
    if (!ctx.isSuperAdmin && entry.branchId !== ctx.branchId) {
      throw new ForbiddenException('Cross-branch queue access is not authorized');
    }

    const updated = await this.prisma.queueEntry.update({
      where: { id },
      data: {
        ...(dto.status ? { status: this.normalizeQueueStatus(dto.status) } : {}),
        ...(dto.assignedDoctorId !== undefined ? { assignedDoctorId: dto.assignedDoctorId } : {}),
        ...(dto.roomId !== undefined ? { roomId: dto.roomId } : {}),
        ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
        ...(dto.priority ? { priority: this.normalizeQueuePriority(dto.priority) } : {}),
        ...(dto.status === 'CALLED' ? { calledTime: new Date() } : {}),
        ...(dto.status === 'COMPLETED' || dto.status === 'CANCELLED'
          ? { completedTime: new Date() }
          : {}),
      },
      include: {
        patient: { select: { fullName: true, pid: true } },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      branchId: updated.branchId,
      patientId: updated.patientId,
      patientName: updated.patient.fullName,
      patientPid: updated.patient.pid,
      departmentId: updated.departmentId,
      roomId: updated.roomId,
      assignedDoctorId: updated.assignedDoctorId,
      ticketNumber: updated.ticketNumber,
      priority: updated.priority,
      status: updated.status,
      checkInTime: updated.checkInTime.toISOString(),
      calledTime: updated.calledTime?.toISOString() ?? null,
      completedTime: updated.completedTime?.toISOString() ?? null,
    };
  }

  // ─── Appointments ─────────────────────────────────────────────────────────

  async getAppointments(
    ctx: TenantContext,
    date?: string,
    doctorId?: string,
    patientId?: string,
  ): Promise<AppointmentDTO[]> {
    const { tenantId, branchId, isSuperAdmin } = ctx;

    const where: Record<string, unknown> = {};
    if (patientId) {
      where.patientId = patientId;
      if (tenantId) where.tenantId = tenantId;
      // Do not restrict by branchId when querying a patient's historical encounters
    } else {
      if (branchId) where.branchId = branchId;
      else if (tenantId) where.tenantId = tenantId;
    }
    if (date) where.appointmentDate = new Date(date);
    if (doctorId) where.doctorId = doctorId;

    const appointments = await this.prisma.appointment.findMany({
      where: where as any,
      include: {
        patient: { select: { fullName: true, pid: true } },
        doctor: { select: { displayName: true } },
        branch: { select: { name: true } },
      },
      orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
    });

    return appointments.map((a) => ({
      id: a.id,
      tenantId: a.tenantId,
      branchId: a.branchId,
      branchName: a.branch?.name ?? null,
      patientId: a.patientId,
      patientName: a.patient.fullName,
      patientPid: a.patient.pid,
      doctorId: a.doctorId,
      doctorName: a.doctor?.displayName ?? null,
      departmentId: a.departmentId,
      roomId: a.roomId,
      appointmentDate: a.appointmentDate.toISOString(),
      startTime: a.startTime,
      endTime: a.endTime,
      type: a.type,
      status: a.status,
      reason: a.reason,
      notes: a.notes,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  async createAppointment(
    dto: CreateAppointmentRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<AppointmentDTO> {
    const { tenantId, branchId } = ctx;
    if (!tenantId || !branchId) {
      throw new ForbiddenException('Tenant and Branch context required to create an appointment');
    }

    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found in this organization');

    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        branchId,
        patientId: dto.patientId,
        appointmentDate: new Date(dto.appointmentDate),
        startTime: dto.startTime,
        type: this.normalizeAppointmentType(dto.type),
        status: AppointmentStatus.SCHEDULED,
        ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
        ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
        ...(dto.roomId ? { roomId: dto.roomId } : {}),
        ...(dto.endTime ? { endTime: dto.endTime } : {}),
        ...(dto.reason ? { reason: dto.reason } : {}),
        ...(dto.notes ? { notes: dto.notes } : {}),
      },
      include: {
        patient: { select: { fullName: true, pid: true } },
        doctor: { select: { displayName: true } },
      },
    });

    return {
      id: appointment.id,
      tenantId: appointment.tenantId,
      branchId: appointment.branchId,
      patientId: appointment.patientId,
      patientName: appointment.patient.fullName,
      patientPid: appointment.patient.pid,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor?.displayName ?? null,
      departmentId: appointment.departmentId,
      roomId: appointment.roomId,
      appointmentDate: appointment.appointmentDate.toISOString(),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      type: appointment.type,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
    };
  }

  async updateAppointment(
    id: string,
    dto: UpdateAppointmentRequest,
    ctx: TenantContext,
  ): Promise<AppointmentDTO> {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException(`Appointment ${id} not found`);
    if (!ctx.isSuperAdmin && appt.branchId !== ctx.branchId && appt.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.doctorId !== undefined ? { doctorId: dto.doctorId } : {}),
        ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
        ...(dto.roomId !== undefined ? { roomId: dto.roomId } : {}),
        ...(dto.appointmentDate ? { appointmentDate: new Date(dto.appointmentDate) } : {}),
        ...(dto.startTime ? { startTime: dto.startTime } : {}),
        ...(dto.endTime !== undefined ? { endTime: dto.endTime } : {}),
        ...(dto.type ? { type: this.normalizeAppointmentType(dto.type) } : {}),
        ...(dto.status ? { status: this.normalizeAppointmentStatus(dto.status) } : {}),
        ...(dto.reason !== undefined ? { reason: dto.reason } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: {
        patient: { select: { fullName: true, pid: true } },
        doctor: { select: { displayName: true } },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      branchId: updated.branchId,
      patientId: updated.patientId,
      patientName: updated.patient.fullName,
      patientPid: updated.patient.pid,
      doctorId: updated.doctorId,
      doctorName: updated.doctor?.displayName ?? null,
      departmentId: updated.departmentId,
      roomId: updated.roomId,
      appointmentDate: updated.appointmentDate.toISOString(),
      startTime: updated.startTime,
      endTime: updated.endTime,
      type: updated.type,
      status: updated.status,
      reason: updated.reason,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
