import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import {
  AnnouncementScope,
  BillStatus,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  PaymentMethod,
  ResidentType,
  Role,
  VisitorStatus,
  VisitorType,
} from '../../common/enums';
import {
  Amenity,
  AmenitySlot,
  Announcement,
  AnnouncementTarget,
  Bill,
  BillingConfig,
  Block,
  Complaint,
  Flat,
  Payment,
  Resident,
  User,
  Visitor,
} from '../entities';
import { generateUserId } from '../../common/utils/user-id.util';

const DEMO_PASSWORD = 'Passw0rd!123';

async function hash(password: string) {
  return bcrypt.hash(password, APP_CONSTANTS.BCRYPT_COST_FACTOR);
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const blocksRepo: Repository<Block> = app.get(getRepositoryToken(Block));
  const flatsRepo: Repository<Flat> = app.get(getRepositoryToken(Flat));
  const usersRepo: Repository<User> = app.get(getRepositoryToken(User));
  const dataSource = app.get(DataSource);
  const residentsRepo: Repository<Resident> = app.get(
    getRepositoryToken(Resident),
  );
  const billingConfigRepo: Repository<BillingConfig> = app.get(
    getRepositoryToken(BillingConfig),
  );
  const amenitiesRepo: Repository<Amenity> = app.get(
    getRepositoryToken(Amenity),
  );
  const slotsRepo: Repository<AmenitySlot> = app.get(
    getRepositoryToken(AmenitySlot),
  );
  const complaintsRepo: Repository<Complaint> = app.get(
    getRepositoryToken(Complaint),
  );
  const visitorsRepo: Repository<Visitor> = app.get(
    getRepositoryToken(Visitor),
  );
  const billsRepo: Repository<Bill> = app.get(getRepositoryToken(Bill));
  const paymentsRepo: Repository<Payment> = app.get(
    getRepositoryToken(Payment),
  );
  const announcementsRepo: Repository<Announcement> = app.get(
    getRepositoryToken(Announcement),
  );
  const announcementTargetsRepo: Repository<AnnouncementTarget> = app.get(
    getRepositoryToken(AnnouncementTarget),
  );

  console.log('Seeding RSMS demo data...');

  // ---------- Blocks ----------
  const blockNames = ['A', 'B', 'C'];
  const blocks: Block[] = [];
  for (const name of blockNames) {
    let block = await blocksRepo.findOne({ where: { name } });
    if (!block) {
      block = await blocksRepo.save(
        blocksRepo.create({ name, description: `Block ${name}` }),
      );
      console.log(`Created block ${name}`);
    }
    blocks.push(block);
  }

  // ---------- Flats ----------
  const flatTypes = ['2BHK', '3BHK'];
  const flats: Flat[] = [];
  for (const block of blocks) {
    for (let floor = 1; floor <= 3; floor++) {
      for (let unit = 1; unit <= 2; unit++) {
        const flatNumber = `${block.name}-${floor}0${unit}`;
        let flat = await flatsRepo.findOne({
          where: { blockId: block.id, flatNumber },
        });
        if (!flat) {
          flat = await flatsRepo.save(
            flatsRepo.create({
              blockId: block.id,
              floorNumber: floor,
              flatNumber,
              area: unit === 1 ? 950 : 1350,
              flatType: unit === 1 ? flatTypes[0] : flatTypes[1],
              isOccupied: false,
            }),
          );
        }
        flats.push(flat);
      }
    }
  }
  console.log(`Ensured ${flats.length} flats across ${blocks.length} blocks`);

  // ---------- Billing config ----------
  for (const [flatType, baseAmount] of [
    ['2BHK', 5000],
    ['3BHK', 8000],
  ] as const) {
    let config = await billingConfigRepo.findOne({ where: { flatType } });
    if (!config) {
      config = await billingConfigRepo.save(
        billingConfigRepo.create({
          flatType,
          baseAmount,
          extraVehicleCharge: 500,
          commercialSurcharge: 0,
          latePenaltyPercent: APP_CONSTANTS.LATE_PENALTY_PERCENT,
          billingDay: APP_CONSTANTS.BILLING_DAY,
        }),
      );
      console.log(`Created billing config for ${flatType}`);
    }
  }

  // ---------- Users ----------
  async function ensureUser(
    fullName: string,
    email: string,
    role: Role,
    phone: string,
  ): Promise<User> {
    let user = await usersRepo.findOne({ where: { email } });
    if (!user) {
      user = await dataSource.transaction(async (manager) => {
        const transactionUsersRepo = manager.getRepository(User);
        let transactionUser = await transactionUsersRepo.findOne({
          where: { email },
        });

        if (!transactionUser) {
          transactionUser = transactionUsersRepo.create({
            id: await generateUserId(manager, role),
            fullName,
            email,
            role,
            phone,
            passwordHash: await hash(DEMO_PASSWORD),
          });
          console.log(`Created ${role} user ${email}`);
        }

        return transactionUsersRepo.save(transactionUser);
      });
    }
    return user;
  }

  const manager = await ensureUser(
    'Ayesha Rahman',
    'manager@rsms.com',
    Role.MANAGER,
    '+8801710000001',
  );
  await ensureUser(
    'Kamal Hossain',
    'accountant@rsms.com',
    Role.ACCOUNTANT,
    '+8801710000002',
  );
  const guard1 = await ensureUser(
    'Rafiq Islam',
    'guard1@rsms.com',
    Role.GUARD,
    '+8801710000003',
  );
  await ensureUser(
    'Shahin Mia',
    'guard2@rsms.com',
    Role.GUARD,
    '+8801710000004',
  );
  const maintenance1 = await ensureUser(
    'Jamal Uddin',
    'maintenance1@rsms.com',
    Role.MAINTENANCE,
    '+8801710000005',
  );
  await ensureUser(
    'Nasir Khan',
    'maintenance2@rsms.com',
    Role.MAINTENANCE,
    '+8801710000006',
  );

  // ---------- Residents ----------
  const residentSeeds = [
    {
      name: 'Tanvir Ahmed',
      email: 'resident1@rsms.com',
      type: ResidentType.OWNER,
    },
    {
      name: 'Fatima Begum',
      email: 'resident2@rsms.com',
      type: ResidentType.TENANT,
    },
    {
      name: 'Imran Hossain',
      email: 'resident3@rsms.com',
      type: ResidentType.OWNER,
    },
    {
      name: 'Sadia Islam',
      email: 'resident4@rsms.com',
      type: ResidentType.TENANT,
    },
    {
      name: 'Bilal Khan',
      email: 'resident5@rsms.com',
      type: ResidentType.OWNER,
    },
    {
      name: 'Nusrat Jahan',
      email: 'resident6@rsms.com',
      type: ResidentType.TENANT,
    },
  ];

  const residents: Resident[] = [];
  for (let i = 0; i < residentSeeds.length; i++) {
    const seedInfo = residentSeeds[i];
    const user = await ensureUser(
      seedInfo.name,
      seedInfo.email,
      Role.RESIDENT,
      `+88017200000${i + 1}`,
    );

    let resident = await residentsRepo.findOne({ where: { id: user.id } });
    if (!resident) {
      const flat = flats[i];
      resident = await residentsRepo.save(
        residentsRepo.create({
          id: user.id,
          flatId: flat.id,
          type: seedInfo.type,
          emergencyContact: '+8801910000000',
          familyMembers: [{ name: 'Family Member', relation: 'Spouse' }],
          moveInDate: '2024-01-01',
        }),
      );
      flat.isOccupied = true;
      await flatsRepo.save(flat);
      console.log(
        `Created resident ${seedInfo.email} in flat ${flat.flatNumber}`,
      );
    }
    residents.push(resident);
  }

  // ---------- Amenities ----------
  let pool = await amenitiesRepo.findOne({ where: { name: 'Swimming Pool' } });
  if (!pool) {
    pool = await amenitiesRepo.save(
      amenitiesRepo.create({
        name: 'Swimming Pool',
        description: 'Rooftop swimming pool, 6am-9pm',
        capacity: 20,
        location: 'Rooftop',
      }),
    );
    await slotsRepo.save([
      slotsRepo.create({
        amenityId: pool.id,
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '09:00',
      }),
      slotsRepo.create({
        amenityId: pool.id,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '10:00',
      }),
    ]);
    console.log('Created amenity: Swimming Pool');
  }

  let hall = await amenitiesRepo.findOne({ where: { name: 'Community Hall' } });
  if (!hall) {
    hall = await amenitiesRepo.save(
      amenitiesRepo.create({
        name: 'Community Hall',
        description: 'Function hall for events',
        capacity: 100,
        location: 'Ground Floor, Block A',
      }),
    );
    await slotsRepo.save([
      slotsRepo.create({
        amenityId: hall.id,
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '14:00',
      }),
      slotsRepo.create({
        amenityId: hall.id,
        dayOfWeek: 0,
        startTime: '18:00',
        endTime: '22:00',
      }),
    ]);
    console.log('Created amenity: Community Hall');
  }

  // ---------- Complaints ----------
  const existingComplaints = await complaintsRepo.count();
  if (existingComplaints === 0) {
    await complaintsRepo.save([
      complaintsRepo.create({
        residentId: residents[0].id,
        category: ComplaintCategory.PLUMBING,
        priority: ComplaintPriority.HIGH,
        status: ComplaintStatus.PENDING,
        title: 'Leaking kitchen faucet',
        description: 'The kitchen faucet has been leaking for two days.',
      }),
      complaintsRepo.create({
        residentId: residents[1].id,
        assignedToId: maintenance1.id,
        category: ComplaintCategory.ELECTRICAL,
        priority: ComplaintPriority.MEDIUM,
        status: ComplaintStatus.ASSIGNED,
        title: 'Living room light flickering',
        description: 'The main living room light flickers intermittently.',
      }),
      complaintsRepo.create({
        residentId: residents[2].id,
        assignedToId: maintenance1.id,
        category: ComplaintCategory.CIVIL,
        priority: ComplaintPriority.LOW,
        status: ComplaintStatus.RESOLVED,
        title: 'Crack in bedroom wall',
        description: 'Small hairline crack noticed near the window.',
        staffNotes: 'Filled and repainted the crack.',
        resolvedAt: new Date(),
      }),
    ]);
    console.log('Created sample complaints');
  }

  // ---------- Visitors ----------
  const existingVisitors = await visitorsRepo.count();
  if (existingVisitors === 0) {
    await visitorsRepo.save([
      visitorsRepo.create({
        preRegisteredById: residents[0].id,
        flatId: residents[0].flatId,
        visitorName: 'Courier - Pathao',
        phone: '+8801812345678',
        purpose: 'Package delivery',
        visitorType: VisitorType.DELIVERY,
        verificationStatus: VisitorStatus.APPROVED,
        verifiedByGuardId: guard1.id,
        entryTime: new Date(),
      }),
      visitorsRepo.create({
        preRegisteredById: residents[1].id,
        flatId: residents[1].flatId,
        visitorName: 'Dr. Sharmin Akter',
        phone: '+8801912345678',
        purpose: 'Family visit',
        visitorType: VisitorType.REGULAR,
        verificationStatus: VisitorStatus.PENDING,
      }),
    ]);
    console.log('Created sample visitors');
  }

  // ---------- Bills & Payments ----------
  const existingBills = await billsRepo.count();
  if (existingBills === 0) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const paidBill = await billsRepo.save(
      billsRepo.create({
        residentId: residents[0].id,
        month,
        year,
        baseAmount: 5000,
        extraCharges: 0,
        latePenalty: 0,
        totalAmount: 5000,
        dueDate: new Date(year, month - 1, 10).toISOString().slice(0, 10),
        status: BillStatus.PAID,
      }),
    );
    await paymentsRepo.save(
      paymentsRepo.create({
        billId: paidBill.id,
        residentId: residents[0].id,
        amount: 5000,
        method: PaymentMethod.BKASH,
        transactionRef: 'DEMO-TXN-0001',
        isPaid: true,
        paidAt: new Date(),
      }),
    );

    await billsRepo.save(
      billsRepo.create({
        residentId: residents[1].id,
        month,
        year,
        baseAmount: 8000,
        extraCharges: 500,
        latePenalty: 0,
        totalAmount: 8500,
        dueDate: new Date(year, month - 1, 10).toISOString().slice(0, 10),
        status: BillStatus.PENDING,
      }),
    );

    const overdueDueDate = new Date();
    overdueDueDate.setMonth(overdueDueDate.getMonth() - 1);
    await billsRepo.save(
      billsRepo.create({
        residentId: residents[2].id,
        month: overdueDueDate.getMonth() + 1,
        year: overdueDueDate.getFullYear(),
        baseAmount: 5000,
        extraCharges: 0,
        latePenalty: 100,
        totalAmount: 5100,
        dueDate: overdueDueDate.toISOString().slice(0, 10),
        status: BillStatus.OVERDUE,
      }),
    );
    console.log('Created sample bills and a demo payment');
  }

  // ---------- Announcements ----------
  const existingAnnouncements = await announcementsRepo.count();
  if (existingAnnouncements === 0) {
    await announcementsRepo.save(
      announcementsRepo.create({
        publishedById: manager.id,
        title: 'Water supply maintenance',
        body: 'Water supply will be interrupted on Friday 10am-2pm for tank cleaning.',
        scope: AnnouncementScope.ALL,
        publishedAt: new Date(),
      }),
    );

    const blockAnnouncement = await announcementsRepo.save(
      announcementsRepo.create({
        publishedById: manager.id,
        title: 'Block A lift servicing',
        body: 'The lift in Block A will be under maintenance tomorrow from 9am-1pm.',
        scope: AnnouncementScope.BLOCK,
        publishedAt: new Date(),
      }),
    );
    await announcementTargetsRepo.save(
      announcementTargetsRepo.create({
        announcementId: blockAnnouncement.id,
        blockId: blocks[0].id,
      }),
    );
    console.log('Created sample announcements');
  }

  console.log(
    '\nSeed complete. Demo login credentials (password for all: %s):',
    DEMO_PASSWORD,
  );
  console.log('  Manager:      manager@rsms.com');
  console.log('  Accountant:   accountant@rsms.com');
  console.log('  Guard:        guard1@rsms.com / guard2@rsms.com');
  console.log('  Maintenance:  maintenance1@rsms.com / maintenance2@rsms.com');
  console.log('  Residents:    resident1@rsms.com ... resident6@rsms.com');

  await app.close();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
