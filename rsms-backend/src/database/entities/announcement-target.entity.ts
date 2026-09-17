import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Announcement } from './announcement.entity';
import { Block } from './block.entity';

@Entity('announcement_targets')
export class AnnouncementTarget extends BaseEntity {
  @ManyToOne(() => Announcement, (announcement) => announcement.targets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announcementId' })
  announcement: Announcement;

  @Column()
  announcementId: string;

  @ManyToOne(() => Block, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockId' })
  block: Block | null;

  @Column({ type: 'varchar', nullable: true })
  blockId: string | null;

  @Column({ type: 'int', nullable: true })
  floorNumber: number | null;
}
