import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type {
  PatientDTO,
  CreatePatientRequest,
  UpdatePatientRequest,
} from '@mcms/contracts';
import { AuditEventType } from '@mcms/domain';
import type { TenantContext } from '../common/tenant/tenant-context.interface';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  private generatePid(existingCount: number): string {
    const padded = String(existingCount + 1).padStart(6, '0');
    return `PAT-${padded}`;
  }

  private mapToDTO(p: {
    id: string;
    tenantId: string;
    pid: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: Date | null;
    gender: string;
    phoneNumber: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    bloodType: string | null;
    allergies: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRel: string | null;
    status: string;
    createdAt: Date;
  }): PatientDTO {
    return {
      id: p.id,
      tenantId: p.tenantId,
      pid: p.pid,
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth?.toISOString() ?? null,
      gender: p.gender,
      phoneNumber: p.phoneNumber,
      email: p.email,
      address: p.address,
      city: p.city,
      bloodType: p.bloodType,
      allergies: p.allergies,
      emergencyContactName: p.emergencyContactName,
      emergencyContactPhone: p.emergencyContactPhone,
      emergencyContactRel: p.emergencyContactRel,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    };
  }

  async findAll(
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
    search?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: PatientDTO[]; total: number; page: number; limit: number }> {
    const { tenantId, isSuperAdmin } = ctx;
    if (!isSuperAdmin && !tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const where: Record<string, unknown> = isSuperAdmin && !tenantId ? {} : { tenantId: tenantId! };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { pid: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.patient.count({ where: where as any }),
    ]);

    return {
      data: data.map((p) => this.mapToDTO(p)),
      total,
      page,
      limit,
    };
  }

  async findById(id: string, ctx: TenantContext): Promise<PatientDTO> {
    const patient = await this.prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }

    if (!ctx.isSuperAdmin && patient.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cross-tenant patient access is not authorized');
    }

    return this.mapToDTO(patient);
  }

  async create(
    dto: CreatePatientRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<PatientDTO> {
    const tenantId = ctx.tenantId ?? user.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required to register a patient');
    }

    const count = await this.prisma.patient.count({ where: { tenantId } });
    const pid = this.generatePid(count);
    const fullName = `${dto.firstName} ${dto.lastName}`;

    const patient = await this.prisma.patient.create({
      data: {
        tenantId,
        pid,
        firstName: dto.firstName,
        lastName: dto.lastName,
        fullName,
        gender: dto.gender as any ?? 'FEMALE',
        ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
        ...(dto.phoneNumber ? { phoneNumber: dto.phoneNumber } : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.address ? { address: dto.address } : {}),
        ...(dto.city ? { city: dto.city } : {}),
        ...(dto.bloodType ? { bloodType: dto.bloodType } : {}),
        ...(dto.allergies ? { allergies: dto.allergies } : {}),
        ...(dto.emergencyContactName ? { emergencyContactName: dto.emergencyContactName } : {}),
        ...(dto.emergencyContactPhone ? { emergencyContactPhone: dto.emergencyContactPhone } : {}),
        ...(dto.emergencyContactRel ? { emergencyContactRel: dto.emergencyContactRel } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId,
        action: AuditEventType.USER_CREATED,
        resource: 'Patient',
        resourceId: patient.id,
        payload: { pid, fullName },
      },
    });

    return this.mapToDTO(patient);
  }

  async update(
    id: string,
    dto: UpdatePatientRequest,
    ctx: TenantContext,
    user: AuthenticatedUserEntity,
  ): Promise<PatientDTO> {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    if (!ctx.isSuperAdmin && patient.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cross-tenant patient access is not authorized');
    }

    const fullName =
      dto.firstName || dto.lastName
        ? `${dto.firstName ?? patient.firstName} ${dto.lastName ?? patient.lastName}`
        : undefined;

    const updated = await this.prisma.patient.update({
      where: { id },
      data: {
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.lastName ? { lastName: dto.lastName } : {}),
        ...(fullName ? { fullName } : {}),
        ...(dto.gender ? { gender: dto.gender as any } : {}),
        ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
        ...(dto.phoneNumber !== undefined ? { phoneNumber: dto.phoneNumber } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.bloodType !== undefined ? { bloodType: dto.bloodType } : {}),
        ...(dto.allergies !== undefined ? { allergies: dto.allergies } : {}),
        ...(dto.emergencyContactName !== undefined ? { emergencyContactName: dto.emergencyContactName } : {}),
        ...(dto.emergencyContactPhone !== undefined ? { emergencyContactPhone: dto.emergencyContactPhone } : {}),
        ...(dto.emergencyContactRel !== undefined ? { emergencyContactRel: dto.emergencyContactRel } : {}),
        ...(dto.status ? { status: dto.status as any } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: patient.tenantId,
        action: AuditEventType.USER_UPDATED,
        resource: 'Patient',
        resourceId: id,
        payload: dto as any,
      },
    });

    return this.mapToDTO(updated);
  }
}
