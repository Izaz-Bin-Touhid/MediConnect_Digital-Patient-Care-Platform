import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta: Record<string, unknown> | null;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    const response = http.getResponse<{ statusCode: number }>();
    const request = http.getRequest<{ method?: string }>();

    return next.handle().pipe(
      map((body: T) => {
        let data = body;
        let meta: Record<string, unknown> | null = null;

        if (
          typeof body === 'object' &&
          body !== null &&
          'data' in body &&
          'total' in body &&
          'page' in body &&
          'limit' in body &&
          'totalPages' in body
        ) {
          const paginated = body as T & {
            data: T;
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };

          data = paginated.data;
          meta = {
            total: paginated.total,
            page: paginated.page,
            limit: paginated.limit,
            totalPages: paginated.totalPages,
          };
        }

        return {
          success: true,
          message: this.getSuccessMessage(request.method, response.statusCode),
          data,
          meta,
        };
      }),
    );
  }

  private getSuccessMessage(method?: string, statusCode?: number): string {
    if (statusCode === 201) {
      return 'Resource created successfully';
    }
    if (method === 'PATCH') {
      return 'Resource updated successfully';
    }
    if (method === 'DELETE') {
      return 'Resource deleted successfully';
    }
    return 'Request completed successfully';
  }
}
