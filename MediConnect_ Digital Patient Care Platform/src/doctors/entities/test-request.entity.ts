import type { DiagnosticCenter } from '../../coordinator/entities/diagnostic-center.entity.js';
import type { PatientCases } from '../../patient/entities/patient-cases.entity.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TEST_REQUEST')
export class TestRequest {
  @PrimaryGeneratedColumn()
  request_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  request_code: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  case_id: string;

  @ManyToOne('PatientCases', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'case_id',
    referencedColumnName: 'caseId',
    foreignKeyConstraintName: 'FK_TEST_REQUEST_CASE',
  })
  patientCase: PatientCases;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  center_id: string | null;

  @ManyToOne('DiagnosticCenter', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'center_id', referencedColumnName: 'centerId' })
  diagnosticCenter: DiagnosticCenter | null;

  @Column({
    type: 'varchar',
    length: 200,
  })
  test_type: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  patient_decision: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  decision_date: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'DRAFT',
  })
  status: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  request_date: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updated_at: Date;
}
