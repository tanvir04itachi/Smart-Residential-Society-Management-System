import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flat, Resident } from '../../database/entities';
import { FlatsController } from './flats.controller';
import { FlatsService } from './flats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flat, Resident])],
  controllers: [FlatsController],
  providers: [FlatsService],
  exports: [FlatsService],
})
export class FlatsModule {}
