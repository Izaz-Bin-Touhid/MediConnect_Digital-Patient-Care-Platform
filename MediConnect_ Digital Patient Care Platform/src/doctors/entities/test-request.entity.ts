import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TEST_REQUEST')
export class TestRequest {
  @PrimaryGeneratedColumn()
  request_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  request_code: string;

  // Add the PATIENT_CASE foreign key when its entity is integrated.
  @Column({
    type: 'int',
  })
  case_id: number;

  // Add the DIAGNOSTIC_CENTER foreign key when its entity is integrated.
  @Column({
    type: 'int',
    nullable: true,
  })
  center_id: number | null;

  @Column({
    type: 'varchar',
    length: 200,
  })
  test_type: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  patient_decision: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  decision_date: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'DRAFT',
  })
  status: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  request_date: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updated_at: Date;
}
