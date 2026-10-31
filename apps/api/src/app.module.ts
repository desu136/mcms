import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { TenantsModule } from './tenants/tenants.module';
import { BranchesModule } from './branches/branches.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClinicalModule } from './clinical/clinical.module';
import { ClinicAdminModule } from './clinic-admin/clinic-admin.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { TenantGuard } from './common/tenant/tenant.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 200,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    SyncModule,
    UsersModule,
    RolesModule,
    TenantsModule,
    BranchesModule,
    PatientsModule,
    AppointmentsModule,
    ClinicalModule,
    ClinicAdminModule,
  ],
  providers: [
    // Rate limiting guard applied globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // JWT Auth guard applied globally — routes opt out with @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Permissions guard applied globally — routes opt in with @RequirePermissions()
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    // Tenant & Branch isolation guard applied globally
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
