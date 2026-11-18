import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { TestRequests } from '../../doctors/entities/test-request.entity.js';

@Entity('DIAGNOSTIC_CENTER')
export class DiagnosticCenters {
  @PrimaryColumn({ name: 'center_id', type: 'varchar', length: 10 })
  centerId: string;

  @Column({ type: 'varchar', name: 'center_name', length: 150 })
  centerName: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 2000, select: false })
  password: string;

  @Column({ type: 'varchar', length: 1000 })
  location: string;

  @OneToMany('TestRequests', (entity: TestRequests) => entity.center)
  testRequests: TestRequests[];
}
