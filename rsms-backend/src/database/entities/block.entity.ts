import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Flat } from './flat.entity';

@Entity('blocks')
export class Block extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @OneToMany(() => Flat, (flat) => flat.block)
  flats: Flat[];
}
