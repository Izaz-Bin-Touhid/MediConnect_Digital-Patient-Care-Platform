import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtGuards } from '../common/guards/jwt-auth.guard.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctors } from './entities/doctors.entity.js';
import { DoctorProfile } from './entities/doctor-profile.entity.js';
import { DoctorAdvice } from './entities/doctor-advice.entity.js';
import { TestRequest } from './entities/test-request.entity.js';
import { DoctorsController } from './doctors.controller.js';
import { DoctorsService } from './doctors.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Doctors, DoctorProfile, DoctorAdvice, TestRequest])],
  controllers: [DoctorsController],
  providers: [DoctorsService, JwtGuards, RolesGuard],
  exports: [DoctorsService],
})
export class DoctorsModule {}