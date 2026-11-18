import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import type { Patients } from '../../patients/entities/patients.entity.js';
import type { Payments } from '../../payments/entities/payments.entity.js';
import type { CoordinatorProfile } from '../../coordinator/entities/coordinator-profile.entity.js';

@Entity('PATIENT_CASE')
export class PatientCases {
  @PrimaryColumn({
    name: 'case_id',
    type: 'varchar',
    length: 10,
  })
  caseId: string;

  @Column({
    name: 'case_code',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  caseCode: string;

  @ManyToOne('Patients', (patient: Patients) => patient.cases, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'patient_id',
  })
  patient: Patients;

  @Column({
    name: 'doctor_id',
    type: 'varchar',
    length: 10,
  })
  doctorId: string;

  @Column({
    name: 'coordinator_id',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  coordinatorId: string | null;

  @ManyToOne('CoordinatorProfile', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: CoordinatorProfile | null;

  @Column({
    type: 'varchar',
    length: 2000,
  })
  symptoms: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  duration: string;

  @Column({
    type: 'int',
  })
  age: number;

  @Column({
    type: 'varchar',
    length: 20,
  })
  gender: string;

  @Column({
    name: 'previous_illness',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  previousIllness: string | null;

  @Column({
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'draft',
  })
  status: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @OneToMany('Payments', (payment: Payments) => payment.patientCase)
  payments: Payments[];
}
