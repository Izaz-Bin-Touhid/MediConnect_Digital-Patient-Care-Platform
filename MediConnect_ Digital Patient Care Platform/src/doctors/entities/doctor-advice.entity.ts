import type { PatientCases } from '../../patient-cases/entities/patient-cases.entity.js';
﻿import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('DOCTOR_ADVICE')
export class DoctorAdvice {
  @PrimaryGeneratedColumn()
  advice_id: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  case_id: string;

  @ManyToOne('PatientCases', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'case_id',
    referencedColumnName: 'caseId',
    foreignKeyConstraintName: 'FK_DOCTOR_ADVICE_CASE',
  })
  patientCase: PatientCases;

  @Column({
    type: 'text',
  })
  advice_note: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'DRAFT',
  })
  status: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  advice_date: Date;
}
