import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import type { AuthActor } from './auth.types.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { CoordinatorProfile } from '../coordinator/entities/coordinator-profile.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; role: AuthActor['role'] }> {
    const email = dto.email.trim().toLowerCase();

    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const credentials = await this.usersService.findCredentials(
      email,
      dto.role ?? 'coordinator',
    );
    if (!credentials || !(await compare(dto.password, credentials.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
      throw new ServiceUnavailableException(
        'JWT authentication is not configured',
      );
    }
    const actor = credentials.actor;
    return {
      accessToken: await this.jwt.signAsync({ ...actor }),
      role: actor.role,
    };
  }

  async changePassword(
    coordinatorId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const password = await this.hashPassword(dto.newPassword);
    await this.dataSource.transaction(async (manager) => {
      const profile = await manager
        .getRepository(CoordinatorProfile)
        .createQueryBuilder('profile')
        .addSelect('profile.password')
        .where('profile.coordinatorId = :coordinatorId', { coordinatorId })
        .setLock('pessimistic_write')
        .getOne();

      if (
        !profile ||
        Buffer.byteLength(dto.currentPassword, 'utf8') > 72 ||
        !(await compare(dto.currentPassword, profile.password))
      ) {
        throw new UnauthorizedException('Invalid current password');
      }
      await manager.update(
        CoordinatorProfile,
        { coordinatorId },
        {
          password,
          tokenVersion: profile.tokenVersion + 1,
        },
      );
    });
  }

  async logout(coordinatorId: string): Promise<void> {
    await this.dataSource.manager.increment(
      CoordinatorProfile,
      { coordinatorId },
      'tokenVersion',
      1,
    );
  }

  async hashPassword(password: string): Promise<string> {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException('Password must be at most 72 UTF-8 bytes');
    }
    return hash(password, 12);
  }
}
