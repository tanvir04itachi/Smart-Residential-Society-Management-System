import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Block } from './block.entity';
import { Resident } from './resident.entity';

@Entity('flats')
export class Flat extends BaseEntity {
  @ManyToOne(() => Block, (block) => block.flats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockId' })
  block: Block;

  @Column()
  blockId: string;

  @Column()
  floorNumber: number;

  @Column()
  flatNumber: string;

  @Column({ type: 'float', nullable: true })
  area: number | null;

  @Column({ type: 'varchar', nullable: true })
  flatType: string | null;

  @Column({ default: false })
  isOccupied: boolean;

  @OneToMany(() => Resident, (resident) => resident.flat)
  residents: Resident[];
}
