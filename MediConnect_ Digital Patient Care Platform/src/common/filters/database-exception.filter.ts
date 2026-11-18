import {
  ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const databaseError = exception.driverError as { code?: string };
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'An unexpected database error occurred';

    if (databaseError.code === '23505') {
      statusCode = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = 'A record with this unique value already exists';
    } else if (databaseError.code === '23503') {
      statusCode = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = 'Related record is missing or this record is still in use';
    } else if (['23502', '23514', '22003', '22001', '22P02'].includes(databaseError.code ?? '')) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
      message = 'The supplied data does not satisfy the database constraints';
    } else {
      // Keep SQL, parameters and internal details out of responses and logs.
      this.logger.error('An unexpected database operation failed');
    }

    response.status(statusCode).json({ message, error, statusCode });
  }
}
