import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { AnnouncementScope } from '../../common/enums';
import { AnnouncementTarget } from './announcement-target.entity';

@Entity('announcements')
export class Announcement extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'publishedById' })
  publishedBy: User | null;

  @Column({ type: 'varchar', nullable: true })
  publishedById: string | null;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: AnnouncementScope })
  scope: AnnouncementScope;

  @Column({ type: 'varchar', nullable: true })
  attachmentUrl: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @OneToMany(() => AnnouncementTarget, (target) => target.announcement)
  targets: AnnouncementTarget[];
}
