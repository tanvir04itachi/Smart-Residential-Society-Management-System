import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Resident } from './resident.entity';
import { User } from './user.entity';
import {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from '../../common/enums';

@Entity('complaints')
export class Complaint extends BaseEntity {
  @ManyToOne(() => Resident, (resident) => resident.complaints, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column({ type: 'varchar', length: 20 })
  residentId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  assignedToId: string | null;

  @Column({ type: 'enum', enum: ComplaintCategory })
  category: ComplaintCategory;

  @Column({
    type: 'enum',
    enum: ComplaintPriority,
    default: ComplaintPriority.MEDIUM,
  })
  priority: ComplaintPriority;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  status: ComplaintStatus;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  staffNotes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;
}
