import { AdminsModule } from './admins/admins.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AppConfigModule } from './config/config.module.js';
import { DoctorsModule } from './doctors/doctors.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { PatientCasesModule } from './patient-cases/patient-cases.module.js';
import { PaymentsModule } from './payments/payments.module.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    DoctorsModule,
    AuthModule,
    AdminsModule,
    PatientsModule,
    PatientCasesModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
