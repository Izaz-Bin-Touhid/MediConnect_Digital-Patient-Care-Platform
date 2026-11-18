import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { PatientCases } from './patient-cases.entity.js';

@Entity('PATIENT')
export class Patients {
  @PrimaryColumn({
    name: 'patient_id',
    type: 'varchar',
    length: 10,
  })
  patientId: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 100,
  })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 2000,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'patient',
  })
  role: string;

  @OneToMany(
    'PatientCases',
    (patientCase: PatientCases) => patientCase.patient,
  )
  cases: PatientCases[];
}
