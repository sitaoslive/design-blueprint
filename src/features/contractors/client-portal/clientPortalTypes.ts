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

// ============================================================================
// PART 2 EXTENSIONS: PROJECT ROOM, CARE CALENDAR, COMMERCIAL & STUDIO
// ============================================================================

export interface ProjectMilestone {
  index: number;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  targetDate: string;
  completedAt?: string;
  notes?: string;
  photos?: string[];
}

export interface ProjectDocument {
  id: string;
  title: string;
  category: 'PROPOSAL' | 'BLUEPRINT' | 'PERMIT' | 'CHANGE_ORDER' | 'WARRANTY' | 'COMPLETION_REPORT';
  url: string;
  date: string;
  size: string;
}

export interface ProjectDecision {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  dueDate: string;
  impactUSD?: number;
}

export interface ClientProjectRoom {
  id: string;
  jobId?: string;
  projectTitle: string;
  projectType: string;
  currentStage: string;
  contractorLead: string;
  contractorPhone: string;
  targetCompletionDate: string;
  totalBudgetUSD: number;
  approvedScopeSummary: string;
  milestones: ProjectMilestone[];
  documents: ProjectDocument[];
  decisions: ProjectDecision[];
}

export interface PropertyCareEntry {
  id: string;
  propertyId: string;
  tradeCategory: 'HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'ROOFING' | 'LANDSCAPING' | 'CLEANING' | 'PEST_CONTROL';
  title: string;
  frequency: string;
  dueMonth: string;
  isCoveredByPlan: boolean;
  status: 'SCHEDULED' | 'COMPLETED' | 'OVERDUE';
  lastPerformedDate?: string;
}

export interface ClientReferralData {
  programName: string;
  referralCode: string;
  shareUrl: string;
  referrerRewardUSD: number;
  refereeDiscountUSD: number;
  totalReferralsSent: number;
  successfulBookings: number;
  earnedRewardsUSD: number;
}

export interface CommercialAccount {
  id: string;
  companyName: string;
  accountNumber: string;
  spendingLimitUSD: number;
  paymentTermsDays: number;
  approvalThresholdUSD: number;
  propertiesCount: number;
  activeWorkOrdersCount: number;
}

export interface ContractorAppStudioConfig {
  designCollection: string;
  companyDisplayName: string;
  brandLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  welcomeHeadline: string;
  enabledWidgets: {
    booking: boolean;
    estimates: boolean;
    invoices: boolean;
    projectRoom: boolean;
    propertyPassport: boolean;
    careCalendar: boolean;
    referrals: boolean;
    aiConcierge: boolean;
    commercialMode: boolean;
  };
  aiConciergeTone: 'PROFESSIONAL_HELPFUL' | 'FRIENDLY_WARM' | 'EXECUTIVE_FORMAL' | 'FIELD_DIRECT';
  referralRewardUSD: number;
  publishedVersion: number;
}

export interface ContractorBusinessImpact {
  inquiriesCaptured: number;
  bookingsCompleted: number;
  estimatesApproved: number;
  onlinePaymentsUSD: number;
  repeatBookingsRetained: number;
  selfServiceActions: number;
  adminHoursSaved: number;
}

