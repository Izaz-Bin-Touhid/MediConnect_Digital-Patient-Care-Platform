import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import type { CoordinationTask } from './coordination-task.entity.js';
@Entity('COORDINATION_ACTIVITY')
export class CoordinationActivity {
  @PrimaryGeneratedColumn('uuid', { name: 'activity_id' })
  activityId: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne('CoordinationTask', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'task_id' })
  task: CoordinationTask;

  @Column({
    name: 'coordinator_id',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  coordinatorId: string | null;

  @Column({ name: 'action', type: 'varchar', length: 40 })
  action: string;

  @Column({ name: 'note', type: 'varchar', length: 1000, nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
