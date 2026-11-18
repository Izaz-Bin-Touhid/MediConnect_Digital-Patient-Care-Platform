import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthActor } from '../../auth/auth.types.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthActor => {
    const user = context.switchToHttp().getRequest().user;
    return {
      sub: String(user.id ?? user.doctor_id ?? user.admin_id ?? user.coordinatorId ?? user.centerId),
      role: user.role.toLowerCase(),
      tokenVersion: user.tokenVersion,
    };
  },
);
