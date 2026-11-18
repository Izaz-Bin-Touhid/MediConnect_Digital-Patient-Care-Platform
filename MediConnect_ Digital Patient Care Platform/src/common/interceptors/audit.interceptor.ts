import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { mergeMap } from 'rxjs/operators';
import { AuditLog } from '../../audit/entities/audit-log.entity.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  constructor(private readonly dataSource: DataSource) {}

  private clean(value: unknown): unknown {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(item => this.clean(item));
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value)) {
        if (!/password|token|secret|authorization/i.test(key)) result[key] = this.clean(item);
      }
      return result;
    }
    return value;
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ||
        context.getClass().name === 'AuthController') return next.handle();

    const handler = context.getHandler().name;
    const routes: Record<string, string> = {
      PatientsController: 'PATIENT', PatientCasesController: 'PATIENT_CASE',
      DoctorsController: /Profile/.test(handler) ? 'DOCTOR_PROFILE' : /Advice/.test(handler) ? 'DOCTOR_ADVICE' : /TestRequest/.test(handler) ? 'TEST_REQUEST' : 'DOCTOR',
      AdminsController: /Doctor/.test(handler) ? 'DOCTOR_PROFILE' : 'ADMIN',
      CoordinatorApplicationController: 'COORDINATOR_APPLICATION',
      AdminCoordinatorApplicationsController: 'COORDINATOR_APPLICATION',
      CoordinatorController: /Coordinator/.test(handler) ? 'FOLLOWUP_COORDINATOR' : /Reminder/.test(handler) ? 'REMINDER' : /FollowUp/.test(handler) ? 'FOLLOWUP_SCHEDULE' : /Report/.test(handler) ? 'DIAGNOSTIC_REPORT' : /Task|Contact|Decision|Activities|arrangeTest/.test(handler) ? 'COORDINATION_TASK' : /Case/.test(handler) ? 'PATIENT_CASE' : 'TEST_REQUEST',
      PaymentsController: 'PAYMENT',
    };
    const table = routes[context.getClass().name];
    const metadata = this.dataSource.entityMetadatas.find(item => item.tableName === table);
    const primary = metadata?.primaryColumns[0]?.propertyName;
    const params = Object.values(req.params ?? {});
    let id = params.at(-1) ?? req.body?.patientId ?? req.body?.caseId ?? req.body?.paymentId;
    if (handler === 'getOwnProfile' || handler === 'updateOwnProfile') id = req.user?.admin_id;
    if (context.getClass().name === 'CoordinatorController' && /CoordinatorProfile/.test(handler)) id = req.user?.coordinatorId;
    let previous: unknown = null;
    if (metadata && primary && id !== undefined) {
      try { previous = await this.dataSource.getRepository(metadata.target).findOne({ where: { [primary]: id } }); } catch {}
    }
    return next.handle().pipe(mergeMap(async body => {
      const actual = body?.success === true ? body.data : body;
      const entityId = actual?.[primary ?? ''] ?? id ?? null;
      const user = req.user;
      const actorId = user?.id ?? user?.doctor_id ?? user?.admin_id ?? actual?.patientId ?? actual?.doctor_id ?? 'anonymous';
      try {
        const repo = this.dataSource.getRepository(AuditLog);
        await repo.save(repo.create({
          actorId: String(actorId), role: user?.role ?? 'public', action: req.method,
          entity: table ?? context.getClass().name,
          entityId: entityId === null ? null : String(entityId),
          oldValues: this.clean(previous), newValues: req.method === 'DELETE' ? null : this.clean(actual ?? req.body),
          ip: req.ip ?? '',
        }));
      } catch { this.logger.error('Audit record could not be saved'); }
      return body;
    }));
  }
}
