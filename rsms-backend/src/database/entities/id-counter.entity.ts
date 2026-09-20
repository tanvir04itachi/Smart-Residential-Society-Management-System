import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('id_counters')
export class IdCounter {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  prefix: string;

  @Column({ type: 'integer' })
  value: number;
}
