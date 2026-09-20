import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Flat } from './flat.entity';
import { ResidentType } from '../../common/enums';
import { Complaint } from './complaint.entity';

@Entity('residents')
export class Resident {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @OneToOne(() => User, (user) => user.resident, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  user: User;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Complaint, (complaint) => complaint.resident)
  complaints: Complaint[];
}
