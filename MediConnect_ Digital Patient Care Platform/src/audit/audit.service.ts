import { Injectable, Logger } from '@nestjs/common';
import type { AuthActor } from '../auth/auth.types.js';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  record(actor: AuthActor, operation: string, statusCode: number): void {
    this.logger.log({
      actorId: actor.sub,
      role: actor.role,
      operation,
      statusCode,
    });
  }
}
