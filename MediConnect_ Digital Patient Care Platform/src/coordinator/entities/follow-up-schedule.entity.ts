import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import type { PatientCases } from '../../patient-cases/entities/patient-cases.entity.js';
@Entity('FOLLOWUP_SCHEDULE')
export class FollowUpSchedule {
  @PrimaryGeneratedColumn('uuid', { name: 'followup_id' })
  followupId: string;

  @Column({ name: 'case_id', type: 'varchar', length: 10 })
  caseId: string;

  @ManyToOne('PatientCases', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'case_id' })
  patientCase: PatientCases;

  @Column({ name: 'followup_code', type: 'varchar', length: 20, unique: true })
  followupCode: string;

  @Column({ name: 'followup_date', type: 'date' })
  followupDate: string;

  @Column({ name: 'followup_time', type: 'time' })
  followupTime: string;

  @Column({ name: 'note', type: 'varchar', length: 1000 })
  note: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'scheduled' })
  status: string;

  @Column({ name: 'outcome', type: 'varchar', length: 1000, nullable: true })
  outcome: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
