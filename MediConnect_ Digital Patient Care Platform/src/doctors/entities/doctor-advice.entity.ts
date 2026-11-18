import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('DOCTOR_ADVICE')
export class DoctorAdvice {
  @PrimaryGeneratedColumn()
  advice_id: number;

  // Add the PATIENT_CASE foreign key when its entity is integrated.
  @Column({
    type: 'int',
  })
  case_id: number;

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
