import { Column, Entity, Index, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from '../../common/enums';
import { Resident } from './resident.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  fullName: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  profilePicture: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @OneToOne(() => Resident, (resident) => resident.user)
  resident: Resident;
}
