import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { PatientCases } from '../../patient-cases/entities/patient-cases.entity.js';

@Entity('DOCTOR')
export class Doctors {
  @PrimaryGeneratedColumn()
  doctor_id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  full_name: string;

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
    length: 255,
    select: false,
  })
  password: string;

  @OneToMany('PatientCases', (patientCase: PatientCases) => patientCase.doctor)
  cases: PatientCases[];
}
