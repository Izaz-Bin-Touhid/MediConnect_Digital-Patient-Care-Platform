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
    const { actor, method } = http.getRequest<Request & AuthRequest>();
    if (actor && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const operation = `${context.getClass().name}.${context.getHandler().name}`;
      const response = http.getResponse<Response>();
      response.once('finish', () =>
        this.auditService.record(actor, operation, response.statusCode),
      );
    }
    return next.handle();
  }
}
