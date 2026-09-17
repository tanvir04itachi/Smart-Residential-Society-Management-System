import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Resident } from './resident.entity';
import { User } from './user.entity';
import { Flat } from './flat.entity';
import { VisitorStatus, VisitorType } from '../../common/enums';

@Entity('visitors')
export class Visitor extends BaseEntity {
  @ManyToOne(() => Resident, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'preRegisteredById' })
  preRegisteredBy: Resident | null;

  @Column({ type: 'varchar', nullable: true })
  preRegisteredById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verifiedByGuardId' })
  verifiedByGuard: User | null;

  @Column({ type: 'varchar', nullable: true })
  verifiedByGuardId: string | null;

  @Column()
  visitorName: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  purpose: string | null;

  @Column({ type: 'enum', enum: VisitorType, default: VisitorType.REGULAR })
  visitorType: VisitorType;

  @Column({ type: 'timestamptz', nullable: true })
  expectedArrival: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  entryTime: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  exitTime: Date | null;

  @Column({
    type: 'enum',
    enum: VisitorStatus,
    default: VisitorStatus.PENDING,
  })
  verificationStatus: VisitorStatus;

  @Column({ default: false })
  isFlagged: boolean;

  @ManyToOne(() => Flat, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'flatId' })
  flat: Flat | null;

  @Column({ type: 'varchar', nullable: true })
  flatId: string | null;
}
