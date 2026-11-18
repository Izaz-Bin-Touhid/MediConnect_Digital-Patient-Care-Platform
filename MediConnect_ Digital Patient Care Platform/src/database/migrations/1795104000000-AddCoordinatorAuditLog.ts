import type { MigrationInterface, QueryRunner } from 'typeorm';

const auditedTables = [
  ['COORDINATOR_APPLICATION', 'application_id', 'approved_at', 'created_at'],
  [
    'FOLLOWUP_COORDINATOR',
    'coordinator_id',
    'admin_id',
    'staff_id',
    'role',
    'token_version',
    'created_at',
  ],
  [
    'PATIENT_CASE',
    'case_id',
    'case_code',
    'coordinator_id',
    'status',
    'created_at',
  ],
  [
    'TEST_REQUEST',
    'request_id',
    'case_id',
    'center_id',
    'status',
    'decision_date',
    'updated_at',
  ],
  ['COORDINATION_TASK', 'task_id', 'request_id', 'created_at'],
  [
    'COORDINATION_ACTIVITY',
    'activity_id',
    'task_id',
    'coordinator_id',
    'action',
    'created_at',
  ],
  [
    'DIAGNOSTIC_REPORT',
    'report_id',
    'request_id',
    'check_status',
    'forwarded_at',
    'status',
    'updated_at',
  ],
  [
    'FOLLOWUP_SCHEDULE',
    'followup_id',
    'case_id',
    'followup_date',
    'followup_time',
    'status',
    'created_at',
  ],
  ['REMINDER', 'reminder_id', 'followup_id', 'response_status', 'sent_date'],
] as const;

export class AddCoordinatorAuditLog1795104000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "AUDIT_LOG" (
        audit_id uuid NOT NULL DEFAULT uuid_generate_v4(),
        actor_id varchar(100),
        actor_role varchar(30),
        action varchar(10) NOT NULL,
        entity varchar(63) NOT NULL,
        record_id varchar(100) NOT NULL,
        old_values jsonb,
        new_values jsonb,
        ip_address varchar(64),
        request_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c2959f1bcaf72ebceb800183d4c" PRIMARY KEY (audit_id)
      )
    `);

    await queryRunner.query(`
      CREATE FUNCTION mediconnect_audit_coordinator_write() RETURNS trigger AS $$
      DECLARE
        old_row jsonb;
        new_row jsonb;
        old_snapshot jsonb;
        new_snapshot jsonb;
        context_data jsonb := NULLIF(current_setting('mediconnect.audit_context', true), '')::jsonb;
      BEGIN
        IF TG_OP <> 'INSERT' THEN
          old_row := to_jsonb(OLD);
          SELECT jsonb_object_agg(key, value) INTO old_snapshot
          FROM jsonb_each(old_row) WHERE key = ANY(TG_ARGV);
        END IF;
        IF TG_OP <> 'DELETE' THEN
          new_row := to_jsonb(NEW);
          SELECT jsonb_object_agg(key, value) INTO new_snapshot
          FROM jsonb_each(new_row) WHERE key = ANY(TG_ARGV);
        END IF;
        INSERT INTO "AUDIT_LOG" (
          actor_id, actor_role, action, entity, record_id, old_values,
          new_values, ip_address, request_id
        ) VALUES (
          context_data->>'actorId', context_data->>'actorRole', TG_OP, TG_TABLE_NAME,
          COALESCE(new_row, old_row)->>TG_ARGV[0], old_snapshot, new_snapshot,
          context_data->>'ipAddress', (context_data->>'requestId')::uuid
        );
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    for (const [table, ...columns] of auditedTables) {
      const args = columns.map((column) => `'${column}'`).join(', ');
      await queryRunner.query(`
        CREATE TRIGGER coordinator_write_audit
        AFTER INSERT OR UPDATE OR DELETE ON "${table}"
        FOR EACH ROW EXECUTE FUNCTION mediconnect_audit_coordinator_write(${args})
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table] of auditedTables) {
      await queryRunner.query(
        `DROP TRIGGER coordinator_write_audit ON "${table}"`,
      );
    }
    await queryRunner.query(
      'DROP FUNCTION mediconnect_audit_coordinator_write()',
    );
    await queryRunner.query('DROP TABLE "AUDIT_LOG"');
  }
}
