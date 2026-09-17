import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Amenity } from './amenity.entity';

@Entity('amenity_slots')
export class AmenitySlot extends BaseEntity {
  @ManyToOne(() => Amenity, (amenity) => amenity.slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'amenityId' })
  amenity: Amenity;

  @Column()
  amenityId: string;

  @Column()
  dayOfWeek: number;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isAvailable: boolean;
}
