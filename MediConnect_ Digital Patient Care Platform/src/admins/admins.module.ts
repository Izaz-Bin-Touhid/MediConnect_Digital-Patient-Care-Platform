import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admins } from './entities/admins.entity.js';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { AdminsController } from './admins.controller.js';
import { AdminsService } from './admins.service.js';
import { JwtGuards } from '../auth/jwtGuards.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Admins, DoctorProfile])],
  controllers: [AdminsController],
  providers: [AdminsService, JwtGuards, RolesGuard],
  exports: [AdminsService],
})
export class AdminsModule {}
