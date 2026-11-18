import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { AuditService } from '../../audit/audit.service.js';
import type { AuthRequest } from '../../auth/auth.types.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const { actor, ip, method } = http.getRequest<Request & AuthRequest>();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }
    const requestId = http.getResponse<Response>().getHeader('X-Request-Id');
    if (typeof requestId !== 'string') {
      return next.handle();
    }
    return new Observable((subscriber) =>
      this.auditService.run(
        {
          actorId: actor?.sub,
          actorRole: actor?.role,
          ipAddress: ip,
          requestId,
        },
        () => next.handle().subscribe(subscriber),
      ),
    );
  }
}
