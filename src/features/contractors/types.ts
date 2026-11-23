export type ContractorServiceType = 
  | 'HVAC' 
  | 'PLUMBING' 
  | 'ELECTRICAL' 
  | 'ROOFING' 
  | 'PAINTING' 
  | 'LANDSCAPING' 
  | 'GENERAL_REMODEL';

export type ContractorUrgencyLevel = 'EMERGENCY' | 'URGENT' | 'STANDARD' | 'FLEXIBLE';

export type ContractorPipelineStage = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'ESTIMATE_SCHEDULED' 
  | 'PROPOSAL_SENT' 
  | 'WON' 
  | 'LOST' 
  | 'ARCHIVED';

export type ContractorJobStatus = 
  | 'SCHEDULED' 
  | 'DISPATCHED' 
  | 'EN_ROUTE' 
  | 'ON_SITE' 
  | 'IN_PROGRESS' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface ContractorLead {
  id: string;
  organization_id: string;
  lead_number: string;
  contact_name: string;
  phone: string;
  email?: string;
  service_type: ContractorServiceType;
  urgency_level: ContractorUrgencyLevel;
  project_address: string;
  city: string;
  estimated_budget_cop?: number;
  pipeline_stage: ContractorPipelineStage;
  lead_score: number;
  lead_source: string;
  notes?: string;
  created_at: string;
}

export interface ContractorCrew {
  id: string;
  crew_name: string;
  trade_specialty: ContractorServiceType;
  lead_technician_name: string;
  lead_technician_phone: string;
  vehicle_plate?: string;
  color_code: string;
  is_active: boolean;
}

export interface ContractorJobPhoto {
  id: string;
  job_id: string;
  photo_type: 'BEFORE' | 'DURING' | 'AFTER' | 'ISSUE_FOUND';
  storage_path: string;
  caption?: string;
  taken_at: string;
}

export interface ContractorJob {
  id: string;
  organization_id: string;
  job_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  job_site_address: string;
  title: string;
  description?: string;
  service_type: ContractorServiceType;
  scheduled_start: string;
  scheduled_end: string;
  status: ContractorJobStatus;
  crew_name?: string;
  total_price_cop: number;
  deposit_paid_cop: number;
  balance_due_cop: number;
  safety_checklist_completed: boolean;
  completion_signature_url?: string;
  photos: ContractorJobPhoto[];
  created_at: string;
}
