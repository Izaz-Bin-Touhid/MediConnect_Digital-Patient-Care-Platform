import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import type { FollowUpSchedule } from './follow-up-schedule.entity.js';
@Entity('REMINDER')
export class Reminder {
  @PrimaryGeneratedColumn('uuid', { name: 'reminder_id' })
  reminderId: string;

  @Column({ name: 'followup_id', type: 'uuid' })
  followupId: string;

  @ManyToOne('FollowUpSchedule', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'followup_id' })
  followup: FollowUpSchedule;

  @Column({ name: 'reminder_code', type: 'varchar', length: 20, unique: true })
  reminderCode: string;

  @Column({ name: 'message', type: 'varchar', length: 1000 })
  message: string;

  @Column({ name: 'sent_date', type: 'timestamptz', nullable: true })
  sentDate: Date | null;

  @Column({
    name: 'response_status',
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  responseStatus: string;
}
