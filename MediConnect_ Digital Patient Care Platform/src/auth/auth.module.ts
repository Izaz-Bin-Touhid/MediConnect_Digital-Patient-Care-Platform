import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DoctorsModule } from '../doctors/doctors.module.js';
import { AdminsModule } from '../admins/admins.module.js';
import { PatientsModule } from '../patient/patients.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import { JwtStrategy } from './jwtStrategy.strategy.js';

@Module({
  imports: [
    PatientsModule,
    DoctorsModule,
    AdminsModule,
    JwtModule.register({
      global: true,
      signOptions: {
        expiresIn: '1H',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuards, JwtStrategy, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}
