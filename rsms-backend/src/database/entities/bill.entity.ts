import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Resident } from './resident.entity';
import { BillStatus } from '../../common/enums';
import { Payment } from './payment.entity';

@Entity('bills')
export class Bill extends BaseEntity {
  @ManyToOne(() => Resident, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column()
  residentId: string;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  extraCharges: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  latePenalty: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.PENDING })
  status: BillStatus;

  @OneToMany(() => Payment, (payment) => payment.bill)
  payments: Payment[];
}
