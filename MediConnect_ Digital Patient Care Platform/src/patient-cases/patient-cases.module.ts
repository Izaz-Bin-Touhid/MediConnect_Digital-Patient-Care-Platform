import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctors } from '../doctors/entities/doctors.entity.js';
import { PatientsModule } from '../patients/patients.module.js';
import { TestRequests } from '../doctors/entities/test-request.entity.js';
import { DoctorAdvice } from '../doctors/entities/doctor-advice.entity.js';
import { DiagnosticCenters } from '../diagnostic-centers/entities/diagnostic-centers.entity.js';
import { DiagnosticReports } from '../diagnostic-centers/entities/diagnostic-reports.entity.js';
import { FollowupSchedules } from '../followups/entities/followup-schedule.entity.js';
import { Reminders } from '../followups/entities/reminders.entity.js';
import { PatientCareController } from './patient-care.controller.js';
import { PatientCareService } from './patient-care.service.js';
import { PatientCases } from './entities/patient-cases.entity.js';
import { PatientCasesController } from './patient-cases.controller.js';
import { PatientCasesService } from './patient-cases.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientCases,
      Doctors,
      TestRequests,
      DoctorAdvice,
      DiagnosticCenters,
      DiagnosticReports,
      FollowupSchedules,
      Reminders,
    ]),
    PatientsModule,
  ],
  controllers: [PatientCasesController, PatientCareController],
  providers: [PatientCasesService, PatientCareService],
  exports: [PatientCasesService],
})
export class PatientCasesModule {}
