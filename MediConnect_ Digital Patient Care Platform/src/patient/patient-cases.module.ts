import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAdvice } from '../doctors/entities/doctor-advice.entity.js';
import { Doctors } from '../doctors/entities/doctors.entity.js';
import { PatientsModule } from './patients.module.js';
import { PatientCases } from './entities/patient-cases.entity.js';
import { PatientCasesController } from './patient-cases.controller.js';
import { PatientCasesService } from './patient-cases.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PatientCases, Doctors, DoctorAdvice]), PatientsModule],
  controllers: [PatientCasesController],
  providers: [PatientCasesService],
  exports: [PatientCasesService],
})
export class PatientCasesModule {}
