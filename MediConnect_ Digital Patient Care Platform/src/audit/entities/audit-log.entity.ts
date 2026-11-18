import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('AUDIT_LOG')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid', { name: 'audit_id' })
  auditId: string;

  @Column({ name: 'actor_id', type: 'varchar', length: 100, nullable: true })
  actorId: string | null;

  @Column({ name: 'actor_role', type: 'varchar', length: 30, nullable: true })
  actorRole: string | null;

  @Column({ type: 'varchar', length: 10 })
  action: string;

  @Column({ type: 'varchar', length: 63 })
  entity: string;

  @Column({ name: 'record_id', type: 'varchar', length: 100 })
  recordId: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, unknown> | null;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
