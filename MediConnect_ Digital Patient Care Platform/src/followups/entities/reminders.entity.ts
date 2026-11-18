import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { FollowupSchedules } from './followup-schedule.entity.js';

@Entity('REMINDER')
export class Reminders {
  @PrimaryColumn({ name: 'reminder_id', type: 'varchar', length: 10 })
  reminderId: string;

  @Column({ type: 'varchar', name: 'reminder_code', length: 20, unique: true })
  reminderCode: string;

  @ManyToOne(
    'FollowupSchedules',
    (entity: FollowupSchedules) => entity.reminders,
    { nullable: false, onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'followup_id' })
  followupSchedule: FollowupSchedules;

  @Column({ type: 'varchar', length: 2000 })
  message: string;

  @Column({ type: 'timestamp', name: 'sent_date', nullable: true })
  sentDate: Date | null;

  @Column({
    type: 'varchar',
    name: 'response_status',
    length: 30,
    default: 'unread',
  })
  responseStatus: string;
}
