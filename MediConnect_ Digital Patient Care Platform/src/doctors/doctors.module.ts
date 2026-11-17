import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Doctors } from './entities/doctors.entity.js';
import { DoctorsController } from './doctors.controller.js';
import { DoctorsService } from './doctors.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Doctors])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}