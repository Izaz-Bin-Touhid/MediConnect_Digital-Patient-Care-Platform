import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import type { CoordinationAdmin } from './coordination-admin.entity.js';

@Entity('FOLLOWUP_COORDINATOR')
export class CoordinatorProfile {
  @PrimaryColumn({ name: 'coordinator_id', type: 'varchar', length: 10 })
  coordinatorId: string;

  @Column({ name: 'admin_id', type: 'varchar', length: 10 })
  adminId: string;

  @ManyToOne('CoordinationAdmin', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'admin_id' })
  admin: CoordinationAdmin;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Column({ name: 'email', type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 25 })
  phone: string;

  @Column({ name: 'password', type: 'varchar', length: 60, select: false })
  password: string;

  @Column({ name: 'role', type: 'varchar', length: 20, default: 'coordinator' })
  role: string;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion: number;

  @Column({ name: 'staff_id', type: 'varchar', length: 30, unique: true })
  staffId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
