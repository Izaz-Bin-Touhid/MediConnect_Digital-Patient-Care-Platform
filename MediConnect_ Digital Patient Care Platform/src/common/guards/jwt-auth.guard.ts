import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtStrategy } from '../../auth/jwt.strategy.js';
import type { AuthRequest } from '../../auth/auth.types.js';
import { PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtStrategy: JwtStrategy,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = /^Bearer (\S+)$/i.exec(
      request.headers.authorization ?? '',
    )?.[1];
    if (!token) {
      throw new UnauthorizedException('A bearer token is required');
    }

    request.actor = await this.jwtStrategy.validate(token);
    return true;
  }
}
