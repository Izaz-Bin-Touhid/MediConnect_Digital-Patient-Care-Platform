import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientCases } from './entities/patient-cases.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([PatientCases])],
})
export class PatientCasesModule {}
