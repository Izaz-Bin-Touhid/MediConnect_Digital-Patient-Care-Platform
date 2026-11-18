import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import type { PatientCases } from '../../patient-cases/entities/patient-cases.entity.js';

@Entity('DOCTOR_ADVICE')
export class DoctorAdvice {
  @PrimaryColumn({ name: 'advice_id', type: 'varchar', length: 10 })
  adviceId: string;

  @ManyToOne('PatientCases', (entity: PatientCases) => entity.adviceRecords, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'case_id' })
  patientCase: PatientCases;

  @Column({ type: 'varchar', name: 'advice_note', length: 2000 })
  adviceNote: string;

  @Column({ type: 'varchar', length: 30, default: 'draft' })
  status: string;

  @CreateDateColumn({ name: 'advice_date' })
  adviceDate: Date;
}
