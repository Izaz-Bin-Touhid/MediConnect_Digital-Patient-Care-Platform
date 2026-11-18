import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireRoles) {
      return true;
    }
    const user = context.switchToHttp().getRequest().user;
    if (!user || !requireRoles.includes(user.role)) {
      return false;
    }
    return true;
  }
}
