import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('billing_config')
export class BillingConfig extends BaseEntity {
  @Column({ unique: true })
  flatType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  extraVehicleCharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commercialSurcharge: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2 })
  latePenaltyPercent: number;

  @Column({ default: 1 })
  billingDay: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User | null;

  @Column({ type: 'varchar', nullable: true })
  updatedById: string | null;
}
