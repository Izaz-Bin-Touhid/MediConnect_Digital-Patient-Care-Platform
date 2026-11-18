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
    return next.handle().pipe(
      map((data: unknown) => {
        if (response.statusCode === 204) return data;
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          return {
            success: true,
            message: 'Request completed',
            data: data.data,
            meta: data.meta,
          };
        }
        const meta = Array.isArray(data)
          ? {
              page: Number(request.query.page ?? 1),
              limit: Number(request.query.limit ?? 20),
              returnedCount: data.length,
            }
          : undefined;
        return { success: true, message: 'Request completed', data, meta };
      }),
    );
  }
}
