import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import {
  Bill,
  BillingConfig,
  Payment,
  Resident,
  User,
} from '../../database/entities';
import { BillStatus, Role } from '../../common/enums';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../common/utils/pagination.util';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigureBillingDto } from './dto/configure-billing.dto';
import { GenerateBillsDto } from './dto/generate-bills.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PDFDocument } from '../../common/utils/pdf.util';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill) private billsRepository: Repository<Bill>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(BillingConfig)
    private billingConfigRepository: Repository<BillingConfig>,
    @InjectRepository(Resident)
    private residentsRepository: Repository<Resident>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  private async getResidentByUserId(userId: string): Promise<Resident> {
    const resident = await this.residentsRepository.findOne({
      where: { userId },
    });
    if (!resident) {
      throw new NotFoundException('Resident profile not found');
    }
    return resident;
  }

  getConfig() {
    return this.billingConfigRepository.find();
  }

  async upsertConfig(dto: ConfigureBillingDto, user: User) {
    let config = await this.billingConfigRepository.findOne({
      where: { flatType: dto.flatType },
    });
    if (config) {
      Object.assign(config, dto, { updatedById: user.id });
    } else {
      config = this.billingConfigRepository.create({
        ...dto,
        updatedById: user.id,
      });
    }
    return this.billingConfigRepository.save(config);
  }

  async generateBills(dto: GenerateBillsDto) {
    const residents = await this.residentsRepository.find({
      where: { isActive: true },
      relations: { user: true, flat: true },
    });

    const configs = await this.billingConfigRepository.find();
    const created: Bill[] = [];

    for (const resident of residents) {
      if (!resident.flat) continue;

      const config = configs.find(
        (c) => c.flatType === resident.flat!.flatType,
      );
      if (!config) continue;

      const bill = await this.createBillForResident(resident, dto, config);
      if (bill) created.push(bill);
    }

    return { created: created.length, bills: created };
  }

  async generateBillForResident(residentId: string, dto: GenerateBillsDto) {
    const resident = await this.residentsRepository.findOne({
      where: { id: residentId },
      relations: { user: true, flat: true },
    });
    if (!resident) {
      throw new NotFoundException('Resident not found');
    }
    if (!resident.isActive) {
      throw new BadRequestException('Cannot generate a bill for an inactive resident');
    }
    if (!resident.flat) {
      throw new BadRequestException('Resident is not assigned to a flat');
    }

    const config = await this.billingConfigRepository.findOne({
      where: { flatType: resident.flat.flatType ?? '' },
    });
    if (!config) {
      throw new BadRequestException(
        `No billing configuration exists for flat type ${resident.flat.flatType ?? 'unknown'}`,
      );
    }

    const bill = await this.createBillForResident(resident, dto, config);
    if (!bill) {
      throw new BadRequestException(
        `A bill already exists for this resident for ${dto.month}/${dto.year}`,
      );
    }

    return bill;
  }

  private async createBillForResident(
    resident: Resident,
    dto: GenerateBillsDto,
    config: BillingConfig,
  ) {
    const existing = await this.billsRepository.findOne({
      where: { residentId: resident.id, month: dto.month, year: dto.year },
    });
    if (existing) return null;

    const baseAmount = Number(config.baseAmount);
    const totalAmount = baseAmount;
    const dueDate = new Date(dto.year, dto.month - 1, config.billingDay + 7)
      .toISOString()
      .slice(0, 10);

    const bill = this.billsRepository.create({
      residentId: resident.id,
      month: dto.month,
      year: dto.year,
      baseAmount,
      extraCharges: 0,
      latePenalty: 0,
      totalAmount,
      dueDate,
      status: BillStatus.PENDING,
    });
    const saved = await this.billsRepository.save(bill);

    await this.notificationsService.create(
      resident.userId,
      'New Bill Generated',
      `A bill of ${totalAmount} has been generated for ${dto.month}/${dto.year}.`,
      'BILL',
      saved.id,
    );
    await this.mailService.sendBillGeneratedEmail(
      resident.user.email,
      dto.month,
      dto.year,
      totalAmount,
      dueDate,
    );

    return saved;
  }

  async findAllBills(query: {
    page?: number;
    limit?: number;
    status?: BillStatus;
  }) {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.billsRepository
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.resident', 'resident')
      .leftJoinAndSelect('resident.user', 'user')
      .leftJoinAndSelect('resident.flat', 'flat')
      .leftJoinAndSelect('flat.block', 'block');

    if (query.status) {
      qb.andWhere('bill.status = :status', { status: query.status });
    }
    qb.orderBy('bill.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, page, limit);
  }

  async findMyBills(user: User) {
    const resident = await this.getResidentByUserId(user.id);
    return this.billsRepository.find({
      where: { residentId: resident.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findBillById(id: string, user: User) {
    const bill = await this.billsRepository.findOne({
      where: { id },
      relations: { resident: { user: true } },
    });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    if (user.role === Role.RESIDENT) {
      const resident = await this.getResidentByUserId(user.id);
      if (bill.residentId !== resident.id) {
        throw new ForbiddenException('Access denied');
      }
    }
    return bill;
  }

  async processPayment(id: string, dto: ProcessPaymentDto, user: User) {
    const resident = await this.getResidentByUserId(user.id);
    const bill = await this.billsRepository.findOne({ where: { id } });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    if (bill.residentId !== resident.id) {
      throw new ForbiddenException('Access denied');
    }
    if (bill.status === BillStatus.PAID) {
      throw new BadRequestException('Bill is already paid');
    }

    const payment = this.paymentsRepository.create({
      billId: bill.id,
      residentId: resident.id,
      amount: bill.totalAmount,
      method: dto.method,
      transactionRef: dto.transactionRef,
      isPaid: true,
      paidAt: new Date(),
    });
    const savedPayment = await this.paymentsRepository.save(payment);

    bill.status = BillStatus.PAID;
    await this.billsRepository.save(bill);

    return savedPayment;
  }

  async generateReceipt(id: string, user: User): Promise<Buffer> {
    const bill = await this.findBillById(id, user);
    const payment = await this.paymentsRepository.findOne({
      where: { billId: bill.id, isPaid: true },
      order: { createdAt: 'DESC' },
    });
    if (!payment) {
      throw new BadRequestException('Bill has not been paid yet');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('RSMS Payment Receipt', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Bill ID: ${bill.id}`);
      doc.text(`Billing Period: ${bill.month}/${bill.year}`);
      doc.text(`Amount Paid: ${payment.amount}`);
      doc.text(`Payment Method: ${payment.method}`);
      doc.text(`Transaction Ref: ${payment.transactionRef}`);
      doc.text(`Paid At: ${payment.paidAt?.toISOString()}`);
      doc.end();
    });
  }

  async defaulters() {
    const today = new Date().toISOString().slice(0, 10);
    const overdueBills = await this.billsRepository.find({
      where: {
        status: Not(BillStatus.PAID),
        dueDate: LessThan(today),
      },
      relations: { resident: { user: true } },
    });

    for (const bill of overdueBills) {
      if (bill.status !== BillStatus.OVERDUE) {
        bill.status = BillStatus.OVERDUE;
        await this.billsRepository.save(bill);
      }
    }

    return overdueBills;
  }

  async sendReminders() {
    const overdueBills = await this.defaulters();
    for (const bill of overdueBills) {
      await this.notificationsService.create(
        bill.resident.userId,
        'Payment Reminder',
        `Your bill of ${bill.totalAmount} for ${bill.month}/${bill.year} is overdue.`,
        'BILL',
        bill.id,
      );
      await this.mailService.sendBillReminderEmail(
        bill.resident.user.email,
        bill.totalAmount,
        bill.dueDate,
      );
    }
    return { remindersSent: overdueBills.length };
  }

  async dashboard() {
    const [totalBilled, totalCollected, pendingCount, overdueCount] =
      await Promise.all([
        this.billsRepository
          .createQueryBuilder('bill')
          .select('SUM(bill.totalAmount)', 'sum')
          .getRawOne<{ sum: string | null }>(),
        this.paymentsRepository
          .createQueryBuilder('payment')
          .select('SUM(payment.amount)', 'sum')
          .where('payment.isPaid = true')
          .getRawOne<{ sum: string | null }>(),
        this.billsRepository.count({ where: { status: BillStatus.PENDING } }),
        this.billsRepository.count({ where: { status: BillStatus.OVERDUE } }),
      ]);

    return {
      totalBilled: Number(totalBilled?.sum ?? 0),
      totalCollected: Number(totalCollected?.sum ?? 0),
      pendingCount,
      overdueCount,
    };
  }
}
