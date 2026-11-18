import {
  ArgumentsHost, Catch, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter extends HttpExceptionFilter {
  private readonly databaseLogger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const databaseError = exception.driverError as { code?: string };
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'An unexpected database error occurred';

    if (databaseError.code === '23505') {
      statusCode = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = 'A record with this unique value already exists';
    } else if (databaseError.code === '23503' || databaseError.code === '23001') {
      statusCode = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = 'Related record is missing or this record is still in use';
    } else if (['23502', '23514', '22003', '22001', '22P02'].includes(databaseError.code ?? '')) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
      message = 'The supplied data does not satisfy the database constraints';
    } else {
      // Keep SQL, parameters and internal details out of responses and logs.
      this.databaseLogger.error('An unexpected database operation failed');
    }

    super.catch(new HttpException({ message, error }, statusCode), host);
  }
}
