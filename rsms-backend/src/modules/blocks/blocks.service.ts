import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../../database/entities';
import { CreateBlockDto } from './dto/create-block.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block) private blocksRepository: Repository<Block>,
  ) {}

  findAll() {
    return this.blocksRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateBlockDto) {
    const existing = await this.blocksRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Block name already exists');
    }
    const block = this.blocksRepository.create(dto);
    return this.blocksRepository.save(block);
  }
}
