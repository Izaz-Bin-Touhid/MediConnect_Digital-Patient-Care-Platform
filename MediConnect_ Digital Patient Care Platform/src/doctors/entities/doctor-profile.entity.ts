import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Doctors } from './doctors.entity.js';
import type { Admins } from '../../admins/entities/admins.entity.js';

@Entity('DOCTOR_PROFILE')
export class DoctorProfile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @Column({
    type: 'int',
    unique: true,
  })
  doctor_id: number;

  @OneToOne('Doctors', {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'doctor_id',
    referencedColumnName: 'doctor_id',
  })
  doctor: Doctors;

  @Column({
    type: 'int',
    nullable: true,
  })
  admin_id: number | null;

  @ManyToOne('Admins', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'admin_id', referencedColumnName: 'admin_id' })
  admin: Admins | null;

  @Column({
    type: 'text',
  })
  qualification: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  specialization: string;

  @Column({
    type: 'int',
  })
  experience_years: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  registration_no: string;

  @Column({
    type: 'text',
    array: true,
    default: '{}',
  })
  supporting_documents: string[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  consultation_fee: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'DRAFT',
  })
  verification_status: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  verified_at: Date | null;
}
