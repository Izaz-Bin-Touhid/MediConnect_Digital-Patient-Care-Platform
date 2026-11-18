import { MailModule } from '../mail/mail.module.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admins } from './entities/admins.entity.js';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { AdminsController } from './admins.controller.js';
import { AdminsService } from './admins.service.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Module({
  imports: [MailModule, TypeOrmModule.forFeature([Admins, DoctorProfile])],
  controllers: [AdminsController],
  providers: [AdminsService, JwtGuards, RolesGuard],
  exports: [AdminsService],
})
export class AdminsModule {}
