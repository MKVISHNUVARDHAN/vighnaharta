export type RoomType =
  | 'living'
  | 'master_bedroom'
  | 'guest_bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'balcony'
  | 'other';

export type ConditionStatus = 'pristine' | 'minor_wear' | 'damaged';

export type InspectionType = 'move_in' | 'move_out';

export type UserRole = 'tenant' | 'landlord';

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  timestamp: string; // ISO string
  displayDate: string; // e.g. "15 Jul 2025, 11:32 AM IST"
  notes: string;
  condition: ConditionStatus;
  quickTags: string[];
  geoTag?: string;
}

export interface ChecklistItem {
  key: string;
  label: string;
  checked: boolean;
}

export interface RoomInspection {
  roomId: RoomType;
  roomName: string;
  isCompleted: boolean;
  media: MediaItem[];
  generalNotes: string;
  overallCondition: ConditionStatus;
  checklist: ChecklistItem[];
}

export interface DeductionItem {
  id: string;
  title: string;
  roomRef: string;
  landlordClaimAmount: number;
  tenantCounterAmount: number;
  agreedAmount: number;
  reason: string;
  evidencePhotoUrl?: string;
  status: 'pending' | 'accepted' | 'disputed' | 'counter_offered' | 'waived';
  tenantNotes?: string;
}

export interface SettlementRecord {
  totalDeposit: number;
  totalDeductionsClaimed: number;
  totalDeductionsAgreed: number;
  finalRefundAmount: number;
  status: 'pending' | 'disputed' | 'agreed' | 'refunded';
  deductions: DeductionItem[];
  tenantSigned: boolean;
  tenantSignature?: string;
  tenantSignDate?: string;
  landlordSigned: boolean;
  landlordSignature?: string;
  landlordSignDate?: string;
  paymentMethod?: 'UPI' | 'NEFT/IMPS' | 'Cheque';
  paymentRef?: string;
  settlementDate?: string;
}

export interface InspectionData {
  inspectionDate: string;
  completedAt?: string;
  signedByTenant: boolean;
  tenantSignature?: string;
  tenantSignDate?: string;
  signedByLandlord: boolean;
  landlordSignature?: string;
  landlordSignDate?: string;
  rooms: Record<RoomType, RoomInspection>;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  rentAmount: number; // in ₹
  depositAmount: number; // in ₹
  moveInDate: string;
  moveOutDate?: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  status:
    | 'move_in_pending'
    | 'move_in_completed'
    | 'move_out_active'
    | 'settlement_in_progress'
    | 'settled';
  moveInReport: InspectionData;
  moveOutReport?: InspectionData;
  settlement: SettlementRecord;
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'property' | 'move_in' | 'move_out' | 'compare' | 'settlement' | 'pdf';
