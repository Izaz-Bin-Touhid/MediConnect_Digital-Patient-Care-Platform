import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CoordinatorModule } from '../coordinator/coordinator.module.js';
import { CoordinationAdmin } from '../coordinator/entities/coordination-admin.entity.js';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { AdminsController } from './admins.controller.js';
import { AdminsService } from './admins.service.js';

@Module({
  imports: [
    AuthModule,
    CoordinatorModule,
    TypeOrmModule.forFeature([CoordinationAdmin, DoctorProfile]),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
