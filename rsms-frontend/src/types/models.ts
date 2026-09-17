import type {
  AnnouncementScope,
  BillStatus,
  BookingStatus,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  PaymentMethod,
  ResidentType,
  Role,
  VisitorStatus,
  VisitorType,
} from './enums';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone: string | null;
  profilePicture: string | null;
  isActive: boolean;
  loginAttempts?: number;
  lockedUntil?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Flat {
  id: string;
  blockId: string;
  block?: Block;
  floorNumber: number;
  flatNumber: string;
  area: number | null;
  flatType: string | null;
  isOccupied: boolean;
  residents?: Resident[];
  createdAt: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
}

export interface Resident {
  id: string;
  userId: string;
  user?: User;
  flatId: string | null;
  flat?: Flat | null;
  type: ResidentType;
  emergencyContact: string | null;
  familyMembers: FamilyMember[] | null;
  moveInDate: string | null;
  moveOutDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  residentId: string;
  resident?: Resident;
  assignedToId: string | null;
  assignedTo?: User | null;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  title: string;
  description: string;
  staffNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  id: string;
  preRegisteredById: string | null;
  verifiedByGuardId: string | null;
  visitorName: string;
  phone: string | null;
  purpose: string | null;
  visitorType: VisitorType;
  expectedArrival: string | null;
  entryTime: string | null;
  exitTime: string | null;
  verificationStatus: VisitorStatus;
  isFlagged: boolean;
  flatId: string | null;
  flat?: Flat | null;
  createdAt: string;
}

export interface Bill {
  id: string;
  residentId: string;
  resident?: Resident;
  month: number;
  year: number;
  baseAmount: number;
  extraCharges: number;
  latePenalty: number;
  totalAmount: number;
  dueDate: string;
  status: BillStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  residentId: string;
  amount: number;
  method: PaymentMethod;
  transactionRef: string;
  isPaid: boolean;
  paidAt: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

export interface BillingConfig {
  id: string;
  flatType: string;
  baseAmount: number;
  extraVehicleCharge: number;
  commercialSurcharge: number;
  latePenaltyPercent: number;
  billingDay: number;
  updatedById: string | null;
  updatedAt: string;
}

export interface AmenitySlot {
  id: string;
  amenityId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  isActive: boolean;
  slots?: AmenitySlot[];
}

export interface Booking {
  id: string;
  residentId: string;
  resident?: Resident;
  amenityId: string;
  amenity?: Amenity;
  slotId: string;
  slot?: AmenitySlot;
  bookingDate: string;
  status: BookingStatus;
  createdAt: string;
}

export interface AnnouncementTarget {
  id: string;
  announcementId: string;
  blockId: string | null;
  floorNumber: number | null;
}

export interface Announcement {
  id: string;
  publishedById: string | null;
  title: string;
  body: string;
  scope: AnnouncementScope;
  attachmentUrl: string | null;
  publishedAt: string | null;
  targets?: AnnouncementTarget[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}
