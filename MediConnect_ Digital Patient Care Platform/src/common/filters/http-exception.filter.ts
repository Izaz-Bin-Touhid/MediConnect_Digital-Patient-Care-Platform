import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();
      response
        .status(statusCode)
        .json(
          typeof payload === 'string'
            ? { statusCode, message: payload }
            : payload,
        );
      return;
    }
    this.logger.error('Unhandled request error');
    response
      .status(500)
      .json({ statusCode: 500, message: 'Internal server error' });
  }
}
