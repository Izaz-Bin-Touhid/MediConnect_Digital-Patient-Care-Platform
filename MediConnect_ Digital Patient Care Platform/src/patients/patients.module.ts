import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patients } from './entities/patients.entity.js';
import { PatientsService } from './patients.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Patients])],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
