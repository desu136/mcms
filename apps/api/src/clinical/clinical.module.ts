import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClinicalController } from './clinical.controller';
import { AdmissionsService } from './admissions.service';
import { VitalsService } from './vitals.service';
import { PrescriptionsService } from './prescriptions.service';
import { MedicationsService } from './medications.service';
import { NursingService } from './nursing.service';
import { LabsService } from './labs.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicalController],
  providers: [
    AdmissionsService,
    VitalsService,
    PrescriptionsService,
    MedicationsService,
    NursingService,
    LabsService,
  ],
  exports: [
    AdmissionsService,
    VitalsService,
    PrescriptionsService,
    MedicationsService,
    NursingService,
    LabsService,
  ],
})
export class ClinicalModule {}
