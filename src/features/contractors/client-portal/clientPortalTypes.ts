export type ClientTab = 'HOME' | 'BOOK' | 'ACTIVITY' | 'MESSAGES' | 'ACCOUNT';

export interface ClientProperty {
  id: string;
  name: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'RENTAL' | 'INDUSTRIAL';
  streetAddress: string;
  unitSuite?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  accessInstructions?: string;
  isPrimary?: boolean;
}

export interface ClientEquipment {
  id: string;
  propertyId: string;
  name: string;
  equipmentType: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  installationDate: string;
  warrantyExpiration: string;
  filterSize?: string;
  status: 'OPERATIONAL' | 'NEEDS_ATTENTION' | 'CRITICAL';
  lastServiceDate?: string;
  nextMaintenanceDue?: string;
}

export interface ProposalTierOption {
  tier: 'GOOD' | 'BETTER' | 'BEST';
  tierName: string;
  priceUSD: number;
  warrantyLabel: string;
  scopeBullets: string[];
  isRecommended?: boolean;
}

export interface ClientProposal {
  id: string;
  estimateId: string;
  projectTitle: string;
  status: 'PENDING_APPROVAL' | 'ACCEPTED' | 'DECLINED';
  acceptedTier?: 'GOOD' | 'BETTER' | 'BEST';
  options: ProposalTierOption[];
  validUntil: string;
  questions: {
    id: string;
    sender: 'CLIENT' | 'STAFF' | 'AI';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
}

export interface ClientChangeOrder {
  id: string;
  jobId: string;
  changeOrderNumber: string;
  title: string;
  description: string;
  additionalCostUSD: number;
  additionalDays: number;
  evidencePhotoUrl?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED';
  clientNotes?: string;
}

export interface ClientMaintenancePlan {
  id: string;
  planName: string;
  propertyName: string;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  priceUSD: number;
  visitsUsed: number;
  visitsTotal: number;
  renewalDate: string;
  priorityDispatch: boolean;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface ClientWarranty {
  id: string;
  code: string;
  coverageTitle: string;
  warrantyType: string;
  startDate: string;
  endDate: string;
  termsSummary: string;
  status: 'ACTIVE' | 'CLAIM_PENDING' | 'EXPIRED';
}

export interface ClientSupportCase {
  id: string;
  caseNumber: string;
  category: string;
  subject: string;
  description: string;
  urgency: 'HIGH' | 'STANDARD';
  status: 'RECEIVED' | 'ASSIGNED' | 'RESOLVED';
  assignedStaff?: string;
  createdAt: string;
}

export interface ClientBookingDraft {
  serviceType: string;
  serviceName: string;
  description: string;
  propertyId: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  selectedDate: string;
  selectedWindow: 'MORNING' | 'AFTERNOON' | 'EVENING';
  diagnosticFeeUSD: number;
}
