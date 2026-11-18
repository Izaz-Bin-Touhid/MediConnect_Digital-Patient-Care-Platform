import { AdminsModule } from '../admins/admins.module.js';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DoctorsModule } from '../doctors/doctors.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtGuards } from './jwtGuards.js';
import { JwtStrategy } from './jwtStrategy.strategy.js';

@Module({
  imports: [
    DoctorsModule,
    AdminsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        if (secret.length < 32) {
          throw new Error('JWT_SECRET must contain at least 32 characters');
        }
        return { secret, signOptions: { expiresIn: '1h', algorithm: 'HS256' } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuards, JwtStrategy],
  exports: [JwtGuards, PassportModule],
})
export class AuthModule {}
