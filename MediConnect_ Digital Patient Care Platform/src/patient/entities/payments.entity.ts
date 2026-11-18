import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import type { PatientCases } from './patient-cases.entity.js';

@Entity('PAYMENT')
export class Payments {
  @PrimaryColumn({
    name: 'payment_id',
    type: 'varchar',
    length: 10,
  })
  paymentId: string;

  @ManyToOne(
    'PatientCases',
    (patientCase: PatientCases) => patientCase.payments,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'case_id',
  })
  patientCase: PatientCases;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  amount: string;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod: string | null;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 150,
    unique: true,
    nullable: true,
  })
  transactionId: string | null;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 30,
    default: 'pending',
  })
  paymentStatus: string;

  @Column({
    name: 'doctor_payable_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  doctorPayableAmount: string;

  @Column({
    name: 'paid_at',
    type: 'timestamp',
    nullable: true,
  })
  paidAt: Date | null;
}
