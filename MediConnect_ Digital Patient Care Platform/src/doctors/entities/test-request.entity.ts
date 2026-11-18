import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PatientCases } from '../../patient-cases/entities/patient-cases.entity.js';
import type { DiagnosticCenters } from '../../diagnostic-centers/entities/diagnostic-centers.entity.js';
import type { DiagnosticReports } from '../../diagnostic-centers/entities/diagnostic-reports.entity.js';

@Entity('TEST_REQUEST')
export class TestRequests {
  @PrimaryColumn({ name: 'request_id', type: 'varchar', length: 10 })
  requestId: string;

  @Column({ type: 'varchar', name: 'request_code', length: 20, unique: true })
  requestCode: string;

  @ManyToOne('PatientCases', (entity: PatientCases) => entity.testRequests, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'case_id' })
  patientCase: PatientCases;

  @Column({ type: 'varchar', name: 'center_id', length: 10, nullable: true })
  centerId: string | null;

  @ManyToOne(
    'DiagnosticCenters',
    (entity: DiagnosticCenters) => entity.testRequests,
    { nullable: true, onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'center_id' })
  center: DiagnosticCenters | null;

  @Column({ type: 'varchar', name: 'test_type', length: 200 })
  testType: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  notes: string | null;

  @Column({
    type: 'varchar',
    name: 'patient_decision',
    length: 20,
    default: 'pending',
  })
  patientDecision: string;

  @Column({ type: 'timestamp', name: 'decision_date', nullable: true })
  decisionDate: Date | null;

  @Column({ type: 'varchar', length: 30, default: 'requested' })
  status: string;

  @CreateDateColumn({ name: 'request_date' })
  requestDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    'DiagnosticReports',
    (entity: DiagnosticReports) => entity.testRequest,
  )
  reports: DiagnosticReports[];
}
