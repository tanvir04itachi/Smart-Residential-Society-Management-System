export enum Role {
  RESIDENT = 'RESIDENT',
  MANAGER = 'MANAGER',
  GUARD = 'GUARD',
  MAINTENANCE = 'MAINTENANCE',
  ACCOUNTANT = 'ACCOUNTANT',
}

export enum ResidentType {
  OWNER = 'OWNER',
  TENANT = 'TENANT',
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export enum ComplaintCategory {
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  CIVIL = 'CIVIL',
  PEST_CONTROL = 'PEST_CONTROL',
  OTHER = 'OTHER',
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum VisitorType {
  REGULAR = 'REGULAR',
  DELIVERY = 'DELIVERY',
  SUSPICIOUS = 'SUSPICIOUS',
}

export enum VisitorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXITED = 'EXITED',
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
}

export enum PaymentMethod {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  CARD = 'CARD',
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum AnnouncementScope {
  ALL = 'ALL',
  BLOCK = 'BLOCK',
  FLOOR = 'FLOOR',
}
