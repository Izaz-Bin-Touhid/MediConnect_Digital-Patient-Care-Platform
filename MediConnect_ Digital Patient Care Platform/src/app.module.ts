import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { EnvironmentModule } from './config/environment.module.js';
import { DoctorsModule } from './doctors/doctors.module.js';
import { PatientsModule } from './patient/patients.module.js';
import { PatientCasesModule } from './patient/patient-cases.module.js';
import { PaymentsModule } from './patient/payments.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    EnvironmentModule,
    DatabaseModule,
    DoctorsModule,
    PatientsModule,
    PatientCasesModule,
    PaymentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
