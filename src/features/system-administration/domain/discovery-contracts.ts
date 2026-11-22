/**
 * VET FREEDOM OS — CONTRATOS DE DESCUBRIMIENTO Y RECONCILIACIÓN WHATSAPP
 * Módulo: discovery-contracts.ts
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 * Fecha: 22 de Noviembre de 2026
 */

export type ServiceIntentType =
  | 'VACCINATION'
  | 'CONSULTATION'
  | 'CONTROL'
  | 'MEDICATION'
  | 'EMERGENCY'
  | 'SPECIALIST'
  | 'NEW_PATIENT'
  | 'OTHER';

export type MatchStatusType =
  | 'MATCHED_EXISTING'
  | 'POTENTIAL_MISSING_PATIENT'
  | 'AMBIGUOUS_MATCH'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_A_PATIENT_INQUIRY'
  | 'OKVET_SNAPSHOT_STALE';

export type ReviewStatusType =
  | 'PENDING_REVIEW'
  | 'CONFIRMED_ALREADY_EXISTS'
  | 'CONFIRMED_MISSING_REGISTERED'
  | 'DISMISSED_NOT_A_PATIENT'
  | 'POSTPONED_REVIEW_LATER'
  | 'MORE_INFO_REQUESTED';

export type LuisDecisionType =
  | 'YA_EXISTE_OKVET'
  | 'NO_ESTA_REGISTRADO'
  | 'NO_ES_PACIENTE'
  | 'REVISAR_DESPUES'
  | 'PEDIR_MAS_INFO';

export interface DiscoveryMetricsDTO {
  last_successful_scan_at: string | null;
  last_whatsapp_message_at: string | null;
  last_okvet_snapshot_date: string | null;
  okvet_snapshot_is_stale: boolean;
  total_okvet_patients_indexed: number;
  total_conversations_evaluated: number;
  potential_missing_patients: number;
  ambiguous_matches: number;
  already_matched_patients: number;
  cases_awaiting_review: number;
  cases_resolved: number;
}

export interface CandidateEvidenceDTO {
  id: string;
  source_message_id: string;
  message_timestamp: string;
  redacted_excerpt: string;
  redaction_applied: boolean;
}

export interface PatientCandidateDTO {
  id: string;
  organization_id: string;
  scan_run_id: string;
  conversation_reference: string;
  contact_reference: string;
  contact_name: string | null;
  candidate_pet_name: string | null;
  candidate_species: 'CANINE';
  service_intent: ServiceIntentType;
  mentioned_date: string | null;
  mentioned_veterinarian: string | null;
  unresolved_pet_count: number;
  confidence_score: number;
  match_status: MatchStatusType;
  matched_pet_id: string | null;
  matched_okvet_patient_id: string | null;
  match_reason: string | null;
  review_status: ReviewStatusType;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  registration_task_id: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  evidence?: CandidateEvidenceDTO[];
}

export interface CandidateFilterParams {
  reviewStatus?: ReviewStatusType | 'ALL';
  matchStatus?: MatchStatusType | 'ALL';
  searchQuery?: string;
}

export interface RecordDecisionParams {
  candidateId: string;
  decision: LuisDecisionType;
  decidedByUserId: string;
  linkedPetId?: string;
  linkedOkvetPatientId?: string;
  notes?: string;
}
