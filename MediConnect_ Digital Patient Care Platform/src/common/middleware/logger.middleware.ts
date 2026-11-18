import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    const method = req.method;
    // Do not log query values, headers or request bodies.
    const path = req.originalUrl.split('?')[0];

    res.once('finish', () => {
      const duration = Date.now() - startedAt;
      this.logger.log(`${method} ${path} ${res.statusCode} ${duration}ms`);
    });

    next();
  }
}
