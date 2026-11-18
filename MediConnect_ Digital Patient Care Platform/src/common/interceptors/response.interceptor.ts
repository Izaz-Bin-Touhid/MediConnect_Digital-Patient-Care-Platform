import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    if (request.get('x-response-envelope') !== 'true') {
      return next.handle();
    }
    return next
      .handle()
      .pipe(
        map((data: unknown) => (response.statusCode === 204 ? data : { data })),
      );
  }
}
