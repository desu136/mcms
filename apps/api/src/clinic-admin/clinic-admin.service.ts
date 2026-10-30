import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ClinicDashboardStatsDTO,
  DoctorDTO,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  ClinicDepartmentDTO,
  CreateClinicDepartmentRequest,
  ClinicRoomDTO,
  CreateClinicRoomRequest,
} from '@mcms/contracts';
import type { TenantContext } from '../common/tenant/tenant-context.interface';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import { AccountStatus, BedStatus, RoomType, RoomStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const AVATAR_COLORS = [
  '#2979FF', '#00C853', '#FF6D00', '#AA00FF',
  '#F44336', '#10B981', '#EC4899', '#8B5CF6', '#06B6D4',
];

@Injectable()
export class ClinicAdminService {
  constructor(private readonly prisma: PrismaService) {}

  private getAvatarInitials(name: string): string {
    const parts = name.replace(/^Dr\.\s*/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
    }
    return (name.slice(0, 2)).toUpperCase();
  }

  private getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index] ?? '#2979FF';
  }

  // ─── Dashboard Stats ────────────────────────────────────────────────────────

  async getDashboardStats(ctx: TenantContext): Promise<ClinicDashboardStatsDTO> {
    const { tenantId, branchId } = ctx;
    const tenantFilter: Record<string, unknown> = tenantId ? { tenantId } : {};
    const branchFilter: Record<string, unknown> = branchId ? { branchId } : {};

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      departments,
      todayAppointments,
      activeQueueCount,
      occupiedBedsCount,
      availableBedsCount,
      recentAppointmentsList,
    ] = await Promise.all([
      this.prisma.patient.count({ where: tenantFilter as any }),
      this.prisma.user.count({
        where: {
          ...(tenantFilter as any),
          deletedAt: null,
          userRoles: {
            some: { role: { name: 'DOCTOR' } },
          },
        },
      }),
      this.prisma.department.findMany({
        where: { ...(tenantFilter as any), ...(branchFilter as any), isActive: true },
        select: {
          id: true,
          name: true,
          color: true,
          appointments: {
            where: {
              createdAt: { gte: todayStart, lte: todayEnd },
            },
            select: { id: true },
          },
        },
      }),
      this.prisma.appointment.count({
        where: {
          ...(tenantFilter as any),
          ...(branchFilter as any),
          appointmentDate: { gte: todayStart, lte: todayEnd },
        },
      }),
      this.prisma.queueEntry.count({
        where: {
          ...(tenantFilter as any),
          ...(branchFilter as any),
          status: { in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] },
        },
      }),
      this.prisma.bed.count({
        where: {
          ...(branchId ? { room: { branchId } } : {}),
          status: BedStatus.OCCUPIED,
        },
      }),
      this.prisma.bed.count({
        where: {
          ...(branchId ? { room: { branchId } } : {}),
          status: BedStatus.AVAILABLE,
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          ...(tenantFilter as any),
          ...(branchFilter as any),
        },
        include: {
          patient: { select: { fullName: true } },
          doctor: { select: { displayName: true } },
          department: { select: { name: true } },
        },
        orderBy: { appointmentDate: 'desc' },
        take: 5,
      }),
    ]);

    const departmentBreakdown = departments.map((d) => ({
      name: d.name,
      doctorsCount: 0,
      patientVisits: d.appointments.length,
      color: d.color ?? '#2979FF',
    }));

    const weeklyTrends = [
      { day: 'Mon', thisWeek: 22, lastWeek: 18 },
      { day: 'Tue', thisWeek: 30, lastWeek: 24 },
      { day: 'Wed', thisWeek: 27, lastWeek: 32 },
      { day: 'Thu', thisWeek: 38, lastWeek: 28 },
      { day: 'Fri', thisWeek: 35, lastWeek: 30 },
      { day: 'Sat', thisWeek: 40, lastWeek: 22 },
      { day: 'Sun', thisWeek: 28, lastWeek: 25 },
    ];

    return {
      totalPatients,
      totalDoctors,
      totalDepartments: departments.length,
      todayAppointmentsCount: todayAppointments,
      activeQueueCount,
      occupiedBedsCount,
      availableBedsCount,
      recentAppointments: recentAppointmentsList.map((a) => ({
        id: a.id,
        patientName: a.patient.fullName,
        doctorName: a.doctor?.displayName ?? 'Unassigned',
        departmentName: a.department?.name ?? 'General',
        appointmentDate: a.appointmentDate.toISOString().split('T')[0] ?? '',
        startTime: a.startTime,
        status: a.status,
      })),
      departmentBreakdown,
      weeklyTrends,
    };
  }

  // ─── Doctors Management ──────────────────────────────────────────────────────

  async getDoctors(ctx: TenantContext): Promise<DoctorDTO[]> {
    const { tenantId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = {
      deletedAt: null,
      userRoles: {
        some: { role: { name: 'DOCTOR' } },
      },
    };
    if (tenantId) where.tenantId = tenantId;

    const doctors = await this.prisma.user.findMany({
      where: where as any,
      include: {
        staffProfile: true,
      },
      orderBy: { displayName: 'asc' },
    });

    return doctors.map((d) => {
      const sp = d.staffProfile;
      return {
        id: d.id,
        email: d.email,
        displayName: d.displayName,
        employeeNumber: sp?.employeeNumber ?? null,
        jobTitle: sp?.jobTitle ?? 'Medical Doctor',
        departmentId: null,
        departmentName: sp?.department ?? 'General Medicine',
        specialty: sp?.jobTitle ?? 'General Practitioner',
        phoneNumber: sp?.phoneNumber ?? null,
        licenseNumber: sp?.licenseNumber ?? null,
        status: d.accountStatus === AccountStatus.ACTIVE ? 'Active' : 'Inactive',
        workHours: 'Mon – Fri 8:00 AM – 5:00 PM',
        avatarInitials: this.getAvatarInitials(d.displayName),
        avatarColor: this.getAvatarColor(d.displayName),
        createdAt: d.createdAt.toISOString(),
      };
    });
  }

  async createDoctor(
    dto: CreateDoctorRequest,
    ctx: TenantContext,
    actor: AuthenticatedUserEntity,
  ): Promise<DoctorDTO> {
    const tenantId = ctx.tenantId ?? actor.tenantId;
    const branchId =
      ctx.branchId ??
      actor.userBranches.find((b) => b.isPrimary)?.branchId ??
      actor.userBranches[0]?.branchId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context required to create doctor');
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException(`Email "${email}" is already in use`);
    }

    const doctorRole = await this.prisma.role.findFirst({
      where: { name: 'DOCTOR' },
    });
    if (!doctorRole) {
      throw new NotFoundException('DOCTOR role not configured');
    }

    const passwordHash = await bcrypt.hash(dto.password || 'Doctor@123456', 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: dto.displayName,
        passwordHash,
        tenantId,
        accountStatus: AccountStatus.ACTIVE,
        userRoles: {
          create: [{ roleId: doctorRole.id }],
        },
        staffProfile: {
          create: {
            employeeNumber: `DOC-${Date.now().toString().slice(-4)}`,
            jobTitle: dto.specialty || 'Medical Doctor',
            department: dto.departmentId || 'General Medicine',
            phoneNumber: dto.phoneNumber ?? null,
            licenseNumber: dto.licenseNumber ?? null,
          },
        },
        ...(branchId
          ? {
              userBranches: {
                create: [{ branchId, isPrimary: true }],
              },
            }
          : {}),
      },
      include: {
        staffProfile: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      employeeNumber: user.staffProfile?.employeeNumber ?? null,
      jobTitle: user.staffProfile?.jobTitle ?? 'Medical Doctor',
      departmentId: null,
      departmentName: user.staffProfile?.department ?? 'General Medicine',
      specialty: user.staffProfile?.jobTitle ?? 'General Practitioner',
      phoneNumber: user.staffProfile?.phoneNumber ?? null,
      licenseNumber: user.staffProfile?.licenseNumber ?? null,
      status: 'Active',
      workHours: dto.workHours || 'Mon – Fri 8:00 AM – 5:00 PM',
      avatarInitials: this.getAvatarInitials(user.displayName),
      avatarColor: this.getAvatarColor(user.displayName),
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateDoctor(
    id: string,
    dto: UpdateDoctorRequest,
    ctx: TenantContext,
  ): Promise<DoctorDTO> {
    const doctor = await this.prisma.user.findUnique({
      where: { id },
      include: { staffProfile: true },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor ${id} not found`);
    }

    if (!ctx.isSuperAdmin && ctx.tenantId && doctor.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.displayName ? { displayName: dto.displayName } : {}),
        ...(dto.status
          ? {
              accountStatus:
                dto.status.toUpperCase() === 'ACTIVE'
                  ? AccountStatus.ACTIVE
                  : AccountStatus.INACTIVE,
            }
          : {}),
        staffProfile: {
          upsert: {
            create: {
              jobTitle: dto.specialty ?? 'Medical Doctor',
              department: dto.departmentId ?? 'General Medicine',
              phoneNumber: dto.phoneNumber ?? null,
              licenseNumber: dto.licenseNumber ?? null,
            },
            update: {
              ...(dto.specialty ? { jobTitle: dto.specialty } : {}),
              ...(dto.departmentId ? { department: dto.departmentId } : {}),
              ...(dto.phoneNumber !== undefined ? { phoneNumber: dto.phoneNumber } : {}),
              ...(dto.licenseNumber !== undefined ? { licenseNumber: dto.licenseNumber } : {}),
            },
          },
        },
      },
      include: { staffProfile: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      employeeNumber: updated.staffProfile?.employeeNumber ?? null,
      jobTitle: updated.staffProfile?.jobTitle ?? 'Medical Doctor',
      departmentId: null,
      departmentName: updated.staffProfile?.department ?? 'General Medicine',
      specialty: updated.staffProfile?.jobTitle ?? 'General Practitioner',
      phoneNumber: updated.staffProfile?.phoneNumber ?? null,
      licenseNumber: updated.staffProfile?.licenseNumber ?? null,
      status: updated.accountStatus === AccountStatus.ACTIVE ? 'Active' : 'Inactive',
      workHours: dto.workHours || 'Mon – Fri 8:00 AM – 5:00 PM',
      avatarInitials: this.getAvatarInitials(updated.displayName),
      avatarColor: this.getAvatarColor(updated.displayName),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  // ─── Departments ─────────────────────────────────────────────────────────────

  async getDepartments(ctx: TenantContext): Promise<ClinicDepartmentDTO[]> {
    const { tenantId, branchId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;

    const departments = await this.prisma.department.findMany({
      where: where as any,
      include: {
        rooms: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    });

    return departments.map((d) => ({
      id: d.id,
      tenantId: d.tenantId,
      branchId: d.branchId,
      name: d.name,
      code: d.code,
      description: d.description,
      color: d.color,
      icon: d.icon,
      isActive: d.isActive,
      doctorsCount: 0,
      roomsCount: d.rooms.length,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  async createDepartment(
    dto: CreateClinicDepartmentRequest,
    ctx: TenantContext,
  ): Promise<ClinicDepartmentDTO> {
    const { tenantId, branchId } = ctx;
    const targetBranchId = dto.branchId ?? branchId;

    if (!tenantId || !targetBranchId) {
      throw new BadRequestException('Tenant and branch context required to create department');
    }

    const department = await this.prisma.department.create({
      data: {
        tenantId,
        branchId: targetBranchId,
        name: dto.name,
        code: dto.code.toUpperCase().trim(),
        description: dto.description ?? null,
        color: dto.color ?? '#2979FF',
        icon: dto.icon ?? 'building',
        isActive: true,
      },
    });

    return {
      id: department.id,
      tenantId: department.tenantId,
      branchId: department.branchId,
      name: department.name,
      code: department.code,
      description: department.description,
      color: department.color,
      icon: department.icon,
      isActive: department.isActive,
      doctorsCount: 0,
      roomsCount: 0,
      createdAt: department.createdAt.toISOString(),
    };
  }

  // ─── Rooms ───────────────────────────────────────────────────────────────────

  async getRooms(ctx: TenantContext, departmentId?: string): Promise<ClinicRoomDTO[]> {
    const { branchId } = ctx;
    const where: Record<string, unknown> = {};
    if (branchId) where.branchId = branchId;
    if (departmentId) where.departmentId = departmentId;

    const rooms = await this.prisma.room.findMany({
      where: where as any,
      include: {
        department: { select: { name: true } },
        beds: true,
      },
      orderBy: { roomNumber: 'asc' },
    });

    return rooms.map((r) => {
      const availableBeds = r.beds.filter((b) => b.status === BedStatus.AVAILABLE).length;
      return {
        id: r.id,
        branchId: r.branchId,
        departmentId: r.departmentId,
        departmentName: r.department.name,
        name: r.name,
        roomNumber: r.roomNumber,
        roomType: r.roomType,
        status: r.status,
        bedsCount: r.beds.length,
        availableBedsCount: availableBeds,
      };
    });
  }

  async createRoom(
    dto: CreateClinicRoomRequest,
    ctx: TenantContext,
  ): Promise<ClinicRoomDTO> {
    const { branchId } = ctx;
    if (!branchId) {
      throw new BadRequestException('Branch context required to create room');
    }

    const roomTypeEnum = (dto.roomType as RoomType) ?? RoomType.CONSULTATION;

    const room = await this.prisma.room.create({
      data: {
        branchId,
        departmentId: dto.departmentId,
        name: dto.name,
        roomNumber: dto.roomNumber,
        roomType: roomTypeEnum,
        status: RoomStatus.AVAILABLE,
        ...(dto.bedsCount && dto.bedsCount > 0
          ? {
              beds: {
                create: Array.from({ length: dto.bedsCount }, (_, i) => ({
                  bedNumber: `Bed ${String(i + 1).padStart(2, '0')}`,
                  status: BedStatus.AVAILABLE,
                })),
              },
            }
          : {}),
      },
      include: {
        department: { select: { name: true } },
        beds: true,
      },
    });

    return {
      id: room.id,
      branchId: room.branchId,
      departmentId: room.departmentId,
      departmentName: room.department.name,
      name: room.name,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      status: room.status,
      bedsCount: room.beds.length,
      availableBedsCount: room.beds.length,
    };
  }
}
