import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { MailModule } from '../mail/mail.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { TestRequest } from '../doctors/entities/test-request.entity.js';
import { PatientCases } from '../patient-cases/entities/patient-cases.entity.js';
import {
  CoordinatorApplicationController,
  CoordinatorController,
} from './coordinator.controller.js';
import { CoordinatorService } from './coordinator.service.js';
import { CoordinationActivity } from './entities/coordination-activity.entity.js';
import { CoordinationAdmin } from './entities/coordination-admin.entity.js';
import { CoordinationTask } from './entities/coordination-task.entity.js';
import { CoordinatorProfile } from './entities/coordinator-profile.entity.js';
import { CoordinatorApplication } from './entities/coordinator-application.entity.js';
import { DiagnosticCenter } from './entities/diagnostic-center.entity.js';
import { DiagnosticReport } from './entities/diagnostic-report.entity.js';
import { FollowUpSchedule } from './entities/follow-up-schedule.entity.js';
import { Reminder } from './entities/reminder.entity.js';

@Module({
  imports: [
    AuditModule,
    MailModule,
    AuthModule,
    TypeOrmModule.forFeature([
      CoordinatorProfile,
      CoordinatorApplication,
      CoordinationAdmin,
      DiagnosticCenter,
      TestRequest,
      PatientCases,
      CoordinationTask,
      CoordinationActivity,
      DiagnosticReport,
      FollowUpSchedule,
      Reminder,
    ]),
  ],
  controllers: [CoordinatorApplicationController, CoordinatorController],
  providers: [CoordinatorService],
  exports: [CoordinatorService],
})
export class CoordinatorModule {}
