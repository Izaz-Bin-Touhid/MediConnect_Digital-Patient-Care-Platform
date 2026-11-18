import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { CoordinatorProfile } from '../coordinator/entities/coordinator-profile.entity.js';
import type { AuthActor } from './auth.types.js';

@Injectable()
export class JwtStrategy {
  constructor(
    private readonly jwt: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async validate(token: string): Promise<AuthActor> {
    let actor: AuthActor;
    try {
      actor = await this.jwt.verifyAsync<AuthActor>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (typeof actor?.sub !== 'string' || !actor.sub) {
      throw new UnauthorizedException('Invalid token subject');
    }
    if (actor.role === 'coordinator') {
      const profile = await this.dataSource.manager.findOneBy(
        CoordinatorProfile,
        {
          coordinatorId: actor.sub,
        },
      );
      if (!profile || profile.tokenVersion !== actor.tokenVersion) {
        throw new UnauthorizedException('This coordinator session has expired');
      }
    }
    return actor;
  }
}
