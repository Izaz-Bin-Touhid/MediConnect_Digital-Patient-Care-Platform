import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { TestRequest } from '../../doctors/entities/test-request.entity.js';

@Entity('COORDINATION_TASK')
export class CoordinationTask {
  @PrimaryGeneratedColumn('uuid', { name: 'task_id' })
  taskId: string;

  @Column({ name: 'request_id', type: 'int', unique: true })
  requestId: number;

  @OneToOne('TestRequest', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'request_id', referencedColumnName: 'request_id' })
  testRequest: TestRequest;

  @Column({ name: 'note', type: 'varchar', length: 1000 })
  note: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
