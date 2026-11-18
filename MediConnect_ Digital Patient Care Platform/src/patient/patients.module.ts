import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpSchedule } from '../coordinator/entities/follow-up-schedule.entity.js';
import { PatientCases } from './entities/patient-cases.entity.js';
import { Payments } from './entities/payments.entity.js';
import { Patients } from './entities/patients.entity.js';
import { PatientsService } from './patients.service.js';
import { PatientsController } from './patients.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Patients, PatientCases, Payments, FollowUpSchedule])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
