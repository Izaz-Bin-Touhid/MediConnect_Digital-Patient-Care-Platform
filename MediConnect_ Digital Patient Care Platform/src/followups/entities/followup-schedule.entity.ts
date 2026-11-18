import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import type { PatientCases } from '../../patient-cases/entities/patient-cases.entity.js';
import type { Reminders } from './reminders.entity.js';

@Entity('FOLLOWUP_SCHEDULE')
export class FollowupSchedules {
  @PrimaryColumn({ name: 'followup_id', type: 'varchar', length: 10 })
  followupId: string;

  @Column({ type: 'varchar', name: 'followup_code', length: 20, unique: true })
  followupCode: string;

  @ManyToOne(
    'PatientCases',
    (entity: PatientCases) => entity.followupSchedules,
    { nullable: false, onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'case_id' })
  patientCase: PatientCases;

  @Column({ type: 'date', name: 'followup_date' })
  followupDate: string;

  @Column({ type: 'time', name: 'followup_time' })
  followupTime: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  note: string | null;

  @Column({ type: 'varchar', length: 30, default: 'scheduled' })
  status: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  outcome: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany('Reminders', (entity: Reminders) => entity.followupSchedule)
  reminders: Reminders[];
}
