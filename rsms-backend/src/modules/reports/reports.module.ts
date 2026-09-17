import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill, Booking, Complaint, Visitor } from '../../database/entities';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint, Bill, Visitor, Booking])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
