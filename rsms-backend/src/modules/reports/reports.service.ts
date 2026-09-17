import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Bill, Booking, Complaint, Visitor } from '../../database/entities';
import { BillStatus, ComplaintStatus } from '../../common/enums';
import { PDFDocument } from '../../common/utils/pdf.util';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintsRepository: Repository<Complaint>,
    @InjectRepository(Bill) private billsRepository: Repository<Bill>,
    @InjectRepository(Visitor) private visitorsRepository: Repository<Visitor>,
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
  ) {}

  async dashboard() {
    const [openComplaints, overdueBills, todayVisitors, activeBookings] =
      await Promise.all([
        this.complaintsRepository.count({
          where: [
            { status: ComplaintStatus.PENDING },
            { status: ComplaintStatus.ASSIGNED },
            { status: ComplaintStatus.IN_PROGRESS },
          ],
        }),
        this.billsRepository.count({ where: { status: BillStatus.OVERDUE } }),
        this.visitorsRepository
          .createQueryBuilder('visitor')
          .where('visitor.createdAt >= :today', {
            today: new Date().toISOString().slice(0, 10),
          })
          .getCount(),
        this.bookingsRepository.count(),
      ]);

    return { openComplaints, overdueBills, todayVisitors, activeBookings };
  }

  async complaintsReport(format: 'pdf' | 'excel') {
    const complaints = await this.complaintsRepository.find({
      relations: { resident: { user: true }, assignedTo: true },
      order: { createdAt: 'DESC' },
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Complaints');
      sheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Resident', key: 'resident', width: 25 },
        { header: 'Assigned To', key: 'assignedTo', width: 25 },
        { header: 'Created At', key: 'createdAt', width: 20 },
      ];
      complaints.forEach((c) => {
        sheet.addRow({
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          resident: c.resident?.user?.fullName ?? '',
          assignedTo: c.assignedTo?.fullName ?? '',
          createdAt: c.createdAt.toISOString(),
        });
      });
      return workbook.xlsx.writeBuffer();
    }

    return this.renderPdfTable(
      'Complaints Report',
      ['Title', 'Category', 'Priority', 'Status', 'Resident'],
      complaints.map((c) => [
        c.title,
        c.category,
        c.priority,
        c.status,
        c.resident?.user?.fullName ?? '',
      ]),
    );
  }

  async billingReport(format: 'pdf' | 'excel') {
    const bills = await this.billsRepository.find({
      relations: { resident: { user: true } },
      order: { createdAt: 'DESC' },
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Billing');
      sheet.columns = [
        { header: 'Resident', key: 'resident', width: 25 },
        { header: 'Month', key: 'month', width: 10 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
      ];
      bills.forEach((b) => {
        sheet.addRow({
          resident: b.resident?.user?.fullName ?? '',
          month: b.month,
          year: b.year,
          totalAmount: b.totalAmount,
          status: b.status,
          dueDate: b.dueDate,
        });
      });
      return workbook.xlsx.writeBuffer();
    }

    return this.renderPdfTable(
      'Billing Report',
      ['Resident', 'Month/Year', 'Total Amount', 'Status', 'Due Date'],
      bills.map((b) => [
        b.resident?.user?.fullName ?? '',
        `${b.month}/${b.year}`,
        String(b.totalAmount),
        b.status,
        b.dueDate,
      ]),
    );
  }

  async visitorsReport(format: 'pdf' | 'excel') {
    const visitors = await this.visitorsRepository.find({
      order: { createdAt: 'DESC' },
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Visitors');
      sheet.columns = [
        { header: 'Visitor Name', key: 'visitorName', width: 25 },
        { header: 'Type', key: 'visitorType', width: 15 },
        { header: 'Status', key: 'verificationStatus', width: 15 },
        { header: 'Entry Time', key: 'entryTime', width: 20 },
        { header: 'Exit Time', key: 'exitTime', width: 20 },
      ];
      visitors.forEach((v) => {
        sheet.addRow({
          visitorName: v.visitorName,
          visitorType: v.visitorType,
          verificationStatus: v.verificationStatus,
          entryTime: v.entryTime?.toISOString() ?? '',
          exitTime: v.exitTime?.toISOString() ?? '',
        });
      });
      return workbook.xlsx.writeBuffer();
    }

    return this.renderPdfTable(
      'Visitor Log Report',
      ['Visitor Name', 'Type', 'Status', 'Entry Time'],
      visitors.map((v) => [
        v.visitorName,
        v.visitorType,
        v.verificationStatus,
        v.entryTime?.toISOString() ?? '',
      ]),
    );
  }

  private renderPdfTable(
    title: string,
    headers: string[],
    rows: string[][],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10);
      doc.text(headers.join(' | '));
      doc.moveDown(0.5);
      rows.forEach((row) => {
        doc.text(row.join(' | '));
      });
      doc.end();
    });
  }
}
