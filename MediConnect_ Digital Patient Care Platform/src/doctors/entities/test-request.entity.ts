import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PatientCases } from '../../patient-cases/entities/patient-cases.entity.js';
import type { DiagnosticCenter } from '../../coordinator/entities/diagnostic-center.entity.js';

@Entity('TEST_REQUEST')
export class TestRequest {
  @PrimaryColumn({ name: 'request_id', type: 'varchar', length: 10 })
  requestId: string;

  @Column({ name: 'request_code', type: 'varchar', length: 20, unique: true })
  requestCode: string;

  @Column({ name: 'case_id', type: 'varchar', length: 10 })
  caseId: string;

  @ManyToOne('PatientCases', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'case_id' })
  patientCase: PatientCases;

  @Column({ name: 'center_id', type: 'varchar', length: 10, nullable: true })
  centerId: string | null;

  @ManyToOne('DiagnosticCenter', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'center_id' })
  diagnosticCenter: DiagnosticCenter | null;

  @Column({ name: 'test_type', type: 'varchar', length: 120 })
  testType: string;

  @Column({ name: 'notes', type: 'varchar', length: 2000, nullable: true })
  notes: string | null;

  @Column({
    name: 'patient_decision',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  patientDecision: string | null;

  @Column({ name: 'decision_date', type: 'timestamptz', nullable: true })
  decisionDate: Date | null;

  @Column({ name: 'status', type: 'varchar', length: 30, default: 'requested' })
  status: string;

  @CreateDateColumn({ name: 'request_date', type: 'timestamptz' })
  requestDate: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
