import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AmenitySlot } from './amenity-slot.entity';

@Entity('amenities')
export class Amenity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => AmenitySlot, (slot) => slot.amenity)
  slots: AmenitySlot[];
}
