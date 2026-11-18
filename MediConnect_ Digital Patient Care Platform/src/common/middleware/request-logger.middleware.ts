import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const started = performance.now();
    const requestId = randomUUID();
    response.setHeader('X-Request-Id', requestId);
    response.once('finish', () => {
      const route = request.route as { path?: string } | undefined;
      const path = route?.path
        ? `${request.baseUrl}${route.path}`
        : '(unmatched route)';
      this.logger.log(
        `${requestId} ${request.method} ${path} ${response.statusCode} ${(performance.now() - started).toFixed(1)} ms`,
      );
    });
    next();
  }
}
