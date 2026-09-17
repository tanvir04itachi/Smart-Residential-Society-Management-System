import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { ReportsService } from './reports.service';

type ReportFormat = 'pdf' | 'excel';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'KPI summary (complaints, dues, visitors, bookings)',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  dashboard() {
    return this.reportsService.dashboard();
  }

  @Get('complaints')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Complaint report (PDF/Excel)' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['pdf', 'excel'],
    example: 'pdf',
  })
  @ApiResponse({ status: 200, description: 'Report file' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  async complaints(
    @Query('format') format: ReportFormat = 'pdf',
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.complaintsReport(format);
    this.sendFile(res, buffer, 'complaints-report', format);
  }

  @Get('billing')
  @Roles(Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Billing report (PDF/Excel)' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['pdf', 'excel'],
    example: 'excel',
  })
  @ApiResponse({ status: 200, description: 'Report file' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  async billing(
    @Query('format') format: ReportFormat = 'pdf',
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.billingReport(format);
    this.sendFile(res, buffer, 'billing-report', format);
  }

  @Get('visitors')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Visitor log report (PDF/Excel)' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['pdf', 'excel'],
    example: 'pdf',
  })
  @ApiResponse({ status: 200, description: 'Report file' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  async visitors(
    @Query('format') format: ReportFormat = 'pdf',
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.visitorsReport(format);
    this.sendFile(res, buffer, 'visitors-report', format);
  }

  private sendFile(
    res: Response,
    buffer: Buffer | ArrayBuffer,
    filenameBase: string,
    format: ReportFormat,
  ) {
    const isExcel = format === 'excel';
    res.set({
      'Content-Type': isExcel
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf',
      'Content-Disposition': `attachment; filename="${filenameBase}.${isExcel ? 'xlsx' : 'pdf'}"`,
    });
    res.send(Buffer.from(buffer as any));
  }
}
