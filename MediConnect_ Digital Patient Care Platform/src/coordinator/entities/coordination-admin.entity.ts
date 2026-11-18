import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ADMIN')
export class CoordinationAdmin {
  @PrimaryColumn({ name: 'admin_id', type: 'varchar', length: 10 })
  adminId: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 25 })
  phone: string;

  @Column({ type: 'varchar', length: 60, select: false })
  password: string;
}
