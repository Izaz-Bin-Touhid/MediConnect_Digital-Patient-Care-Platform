import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = this.getErrorName(status);

      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const responseObject = response as {
          message?: string | string[];
          error?: string;
        };
        message = responseObject.message ?? message;
        error = responseObject.error ?? error;
      }
    } else {
      const databaseError = exception as {
        code?: string;
        driverError?: { code?: string };
      };
      const databaseCode =
        databaseError.driverError?.code ?? databaseError.code;

      if (databaseCode === '23505') {
        status = HttpStatus.CONFLICT;
        error = 'Conflict';
        message = 'A record with the same unique value already exists';
      } else if (databaseCode === '23503' || databaseCode === '23001') {
        status = HttpStatus.CONFLICT;
        error = 'Conflict';
        message = 'The operation conflicts with a related record';
      } else {
        this.logger.error(
          exception instanceof Error
            ? exception.message
            : 'Unknown internal server error',
        );
      }
    }

    httpAdapter.reply(
      ctx.getResponse(),
      {
        success: false,
        statusCode: status,
        error,
        message,
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }

  private getErrorName(status: number): string {
    const names: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };

    return names[status] ?? 'HTTP Error';
  }
}
