import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { TestRequest } from '../../doctors/entities/test-request.entity.js';

@Entity('DIAGNOSTIC_REPORT')
export class DiagnosticReport {
  @PrimaryGeneratedColumn('uuid', { name: 'report_id' })
  reportId: string;

  @Column({ name: 'request_id', type: 'varchar', length: 10, unique: true })
  requestId: string;

  @OneToOne('TestRequest', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'request_id' })
  testRequest: TestRequest;

  @Column({ name: 'result', type: 'varchar', length: 4000 })
  result: string;

  @Column({ name: 'report_file', type: 'varchar', length: 1000 })
  reportFile: string;

  @Column({
    name: 'check_status',
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  checkStatus: string;

  @Column({ name: 'forwarded_at', type: 'timestamptz', nullable: true })
  forwardedAt: Date | null;

  @Column({
    name: 'doctor_notes',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  doctorNotes: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'submitted' })
  status: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
