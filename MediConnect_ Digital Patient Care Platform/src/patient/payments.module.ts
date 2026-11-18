import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { PatientCases } from './entities/patient-cases.entity.js';
import { Payments } from './entities/payments.entity.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payments, PatientCases, DoctorProfile])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
