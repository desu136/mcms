import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClinicAdminController } from './clinic-admin.controller';
import { ClinicAdminService } from './clinic-admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicAdminController],
  providers: [ClinicAdminService],
  exports: [ClinicAdminService],
})
export class ClinicAdminModule {}
