import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Flat } from './flat.entity';
import { ResidentType } from '../../common/enums';
import { Complaint } from './complaint.entity';

@Entity('residents')
export class Resident extends BaseEntity {
  @OneToOne(() => User, (user) => user.resident, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  userId: string;

  @ManyToOne(() => Flat, (flat) => flat.residents, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'flatId' })
  flat: Flat | null;

  @Column({ type: 'varchar', nullable: true })
  flatId: string | null;

  @Column({ type: 'enum', enum: ResidentType })
  type: ResidentType;

  @Column({ type: 'varchar', nullable: true })
  emergencyContact: string | null;

  @Column({ type: 'jsonb', nullable: true })
  familyMembers: Record<string, any>[] | null;

  @Column({ type: 'date', nullable: true })
  moveInDate: string | null;

  @Column({ type: 'date', nullable: true })
  moveOutDate: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Complaint, (complaint) => complaint.resident)
  complaints: Complaint[];
}
