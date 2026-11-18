import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admins } from './entities/admins.entity.js';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { AdminsController, AdminSetupController } from './admins.controller.js';
import { AdminsService } from './admins.service.js';
import { JwtGuards } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Admins, DoctorProfile])],
  controllers: [AdminsController, AdminSetupController],
  providers: [AdminsService, JwtGuards, RolesGuard],
  exports: [AdminsService],
})
export class AdminsModule {}
