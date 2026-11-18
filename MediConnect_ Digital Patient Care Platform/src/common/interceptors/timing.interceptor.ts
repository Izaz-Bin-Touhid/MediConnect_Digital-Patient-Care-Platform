import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = performance.now();
    const response = context.switchToHttp().getResponse<Response>();
    const setTiming = () => {
      if (!response.headersSent) {
        response.setHeader(
          'Server-Timing',
          `handler;dur=${(performance.now() - started).toFixed(1)}`,
        );
      }
    };
    return next.handle().pipe(tap({ next: setTiming, error: setTiming }));
  }
}
