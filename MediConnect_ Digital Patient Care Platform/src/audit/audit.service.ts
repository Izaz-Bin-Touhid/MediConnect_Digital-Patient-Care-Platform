import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { DataSource, EntityManager } from 'typeorm';

interface AuditContext {
  actorId?: string;
  actorRole?: string;
  requestId: string;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly context = new AsyncLocalStorage<AuditContext>();

  constructor(private readonly dataSource: DataSource) {}

  run<T>(context: AuditContext, work: () => T): T {
    return this.context.run(context, work);
  }

  async transaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const runner = this.dataSource.createQueryRunner();
    try {
      await runner.connect();
      await runner.startTransaction();
      const context = this.context.getStore();
      if (context) {
        await runner.query(
          "SELECT set_config('mediconnect.audit_context', $1, true)",
          [JSON.stringify(context)],
        );
      }
      const result = await work(runner.manager);
      await runner.commitTransaction();
      return result;
    } catch (error) {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }
      throw error;
    } finally {
      await runner.release();
    }
  }
}
