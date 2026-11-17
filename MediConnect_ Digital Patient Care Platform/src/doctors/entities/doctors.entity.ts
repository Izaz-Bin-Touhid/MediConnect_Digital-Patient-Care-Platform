import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}