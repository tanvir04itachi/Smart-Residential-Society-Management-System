import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Resident } from './resident.entity';
import { Amenity } from './amenity.entity';
import { AmenitySlot } from './amenity-slot.entity';
import { BookingStatus } from '../../common/enums';

@Entity('bookings')
export class Booking extends BaseEntity {
  @ManyToOne(() => Resident, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'residentId' })
  resident: Resident;

  @Column({ type: 'varchar', length: 20 })
  residentId: string;

  @ManyToOne(() => Amenity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'amenityId' })
  amenity: Amenity;

  @Column()
  amenityId: string;

  @ManyToOne(() => AmenitySlot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slotId' })
  slot: AmenitySlot;

  @Column()
  slotId: string;

  @Column({ type: 'date' })
  bookingDate: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;
}
