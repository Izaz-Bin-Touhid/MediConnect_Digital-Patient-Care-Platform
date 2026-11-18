import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('DIAGNOSTIC_CENTER')
export class DiagnosticCenter {
  @PrimaryColumn({ name: 'center_id', type: 'varchar', length: 10 })
  centerId: string;

  @Column({ name: 'center_name', type: 'varchar', length: 120 })
  centerName: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 25 })
  phone: string;

  @Column({ type: 'varchar', length: 60, select: false })
  password: string;

  @Column({ type: 'varchar', length: 250 })
  location: string;
}
