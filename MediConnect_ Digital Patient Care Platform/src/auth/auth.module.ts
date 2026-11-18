import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';
import { AuthService } from './auth.service.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        return {
          secret:
            secret && Buffer.byteLength(secret, 'utf8') >= 32
              ? secret
              : undefined,
          signOptions: { algorithm: 'HS256', expiresIn: '1h' },
          verifyOptions: { algorithms: ['HS256'] },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, AuthService],
  exports: [JwtStrategy, JwtAuthGuard, RolesGuard, AuthService, JwtModule],
})
export class AuthModule {}
