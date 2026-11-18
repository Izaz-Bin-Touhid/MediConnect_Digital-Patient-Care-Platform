import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { TestRequests } from '../../doctors/entities/test-request.entity.js';

@Entity('DIAGNOSTIC_REPORT')
export class DiagnosticReports {
  @PrimaryColumn({ name: 'report_id', type: 'varchar', length: 10 })
  reportId: string;

  @ManyToOne('TestRequests', (entity: TestRequests) => entity.reports, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'request_id' })
  testRequest: TestRequests;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  result: string | null;

  @Column({
    type: 'varchar',
    name: 'report_file',
    length: 1000,
    nullable: true,
  })
  reportFile: string | null;

  @Column({
    type: 'varchar',
    name: 'check_status',
    length: 30,
    default: 'pending',
  })
  checkStatus: string;

  @Column({ type: 'timestamp', name: 'forwarded_at', nullable: true })
  forwardedAt: Date | null;

  @Column({
    type: 'varchar',
    name: 'doctor_notes',
    length: 2000,
    nullable: true,
  })
  doctorNotes: string | null;

  @Column({ type: 'varchar', length: 30, default: 'submitted' })
  status: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
