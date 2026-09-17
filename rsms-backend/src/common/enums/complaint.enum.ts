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
