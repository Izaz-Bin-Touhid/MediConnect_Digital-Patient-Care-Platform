import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PatientsModule } from '../patients/patients.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtGuards } from './jwtGuards.js';
import { JwtStrategy } from './jwtStrategy.strategy.js';

@Module({
  imports: [
    PatientsModule,
    JwtModule.register({
      global: true,
      signOptions: {
        expiresIn: '1H',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuards, JwtStrategy],
})
export class AuthModule {}
