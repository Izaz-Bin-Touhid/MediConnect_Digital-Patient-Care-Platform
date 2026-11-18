import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticCenters } from '../diagnostic-centers/entities/diagnostic-centers.entity.js';
import { Patients } from './entities/patients.entity.js';
import { PatientsService } from './patients.service.js';
import { PatientsController } from './patients.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Patients, DiagnosticCenters])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
