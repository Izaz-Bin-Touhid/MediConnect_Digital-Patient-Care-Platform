import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const started = performance.now();
    response.once('finish', () => {
      this.logger.log(
        `${request.method} ${response.statusCode} ${(performance.now() - started).toFixed(1)} ms`,
      );
    });
    next();
  }
}
