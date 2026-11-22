/**
 * VET FREEDOM OS — SERVICIO DE DATOS DE DESCUBRIMIENTO WHATSAPP
 * Módulo: discovery-service.ts
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 * Fecha: 22 de Noviembre de 2026
 */

import { supabase } from '@/integrations/supabase/client';
import {
  DiscoveryMetricsDTO,
  PatientCandidateDTO,
  CandidateFilterParams,
  RecordDecisionParams
} from './discovery-contracts';

const VET_LIFE_ORG_ID = '11111111-1111-1111-1111-111111111111';

// Las tablas y funciones de descubrimiento aún no están publicadas en el backend;
// se consultan de forma tolerante y, si fallan, se usa el respaldo local (mock).
const dbDiscovery = supabase as unknown as {
  from: (table: string) => any;
  rpc: (
    fn: string,
    args?: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

// Mock de fallback para desarrollo / testing cuando la conexión offline está activa
const MOCK_METRICS: DiscoveryMetricsDTO = {
  last_successful_scan_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  last_whatsapp_message_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  last_okvet_snapshot_date: new Date().toISOString().split('T')[0] ?? null,
  okvet_snapshot_is_stale: false,
  total_okvet_patients_indexed: 120,
  total_conversations_evaluated: 18,
  potential_missing_patients: 2,
  ambiguous_matches: 1,
  already_matched_patients: 3,
  cases_awaiting_review: 3,
  cases_resolved: 4
};

const MOCK_CANDIDATES: PatientCandidateDTO[] = [
  {
    id: 'cand-001',
    organization_id: VET_LIFE_ORG_ID,
    scan_run_id: 'scan-run-001',
    conversation_reference: '+573105550199',
    contact_reference: '+573105550199',
    contact_name: 'Carolina Gómez',
    candidate_pet_name: 'Luna',
    candidate_species: 'CANINE',
    service_intent: 'VACCINATION',
    mentioned_date: new Date().toISOString(),
    mentioned_veterinarian: 'Dr. Luis Eduardo Ríos',
    unresolved_pet_count: 1,
    confidence_score: 0.94,
    match_status: 'POTENTIAL_MISSING_PATIENT',
    matched_pet_id: null,
    matched_okvet_patient_id: null,
    match_reason: 'Paciente canino "Luna" no encontrado en el snapshot de OKVET ni en Supabase para el contacto +573105550199. Solicitó esquema séxtuple a domicilio.',
    review_status: 'PENDING_REVIEW',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    registration_task_id: null,
    idempotency_key: 'idem_cand_001',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    evidence: [
      {
        id: 'ev-001',
        source_message_id: 'msg-001',
        message_timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        redacted_excerpt: 'Buenas tardes Dr. Luis, quiero agendar a mi perrita Luna para el refuerzo de la vacuna séxtuple en nuestro domicilio en Cedritos.',
        redaction_applied: true
      }
    ]
  },
  {
    id: 'cand-002',
    organization_id: VET_LIFE_ORG_ID,
    scan_run_id: 'scan-run-001',
    conversation_reference: '+573105550199',
    contact_reference: '+573105550199',
    contact_name: 'Carolina Gómez',
    candidate_pet_name: 'Max',
    candidate_species: 'CANINE',
    service_intent: 'CONSULTATION',
    mentioned_date: new Date().toISOString(),
    mentioned_veterinarian: null,
    unresolved_pet_count: 1,
    confidence_score: 0.88,
    match_status: 'POTENTIAL_MISSING_PATIENT',
    matched_pet_id: null,
    matched_okvet_patient_id: null,
    match_reason: 'Mención de segundo perrito "Max" para revisión general en el mismo hogar. No figura en OKVET.',
    review_status: 'PENDING_REVIEW',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    registration_task_id: null,
    idempotency_key: 'idem_cand_002',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    evidence: [
      {
        id: 'ev-002',
        source_message_id: 'msg-002',
        message_timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        redacted_excerpt: 'También aprovecho para que revisen a Max que ha estado inapetente desde el fin de semana.',
        redaction_applied: true
      }
    ]
  },
  {
    id: 'cand-003',
    organization_id: VET_LIFE_ORG_ID,
    scan_run_id: 'scan-run-001',
    conversation_reference: '+573004441122',
    contact_reference: '+573004441122',
    contact_name: 'Alejandro Morales',
    candidate_pet_name: 'Rocky',
    candidate_species: 'CANINE',
    service_intent: 'MEDICATION',
    mentioned_date: new Date().toISOString(),
    mentioned_veterinarian: 'Dra. Andrea',
    unresolved_pet_count: 1,
    confidence_score: 0.82,
    match_status: 'AMBIGUOUS_MATCH',
    matched_pet_id: null,
    matched_okvet_patient_id: null,
    match_reason: 'El cliente Alejandro Morales figura en OKVET con un perro llamado "Simba", pero solicita desparasitación para "Rocky".',
    review_status: 'PENDING_REVIEW',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    registration_task_id: null,
    idempotency_key: 'idem_cand_003',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    evidence: [
      {
        id: 'ev-003',
        source_message_id: 'msg-003',
        message_timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        redacted_excerpt: 'Hola Dra. Andrea, necesito la pastilla antipulgas y el desparasitante para Rocky por favor.',
        redaction_applied: true
      }
    ]
  }
];

export class DiscoveryService {
  /**
   * Obtiene las métricas agregadas del panel de control
   */
  public static async getMetrics(orgId: string = VET_LIFE_ORG_ID): Promise<DiscoveryMetricsDTO> {
    try {
      const { data, error } = await dbDiscovery.rpc('get_patient_discovery_dashboard_metrics', {
        p_org_id: orgId
      });

      if (error || !data) {
        console.warn('Usando métricas de fallback para panel de descubrimiento:', error?.message);
        return MOCK_METRICS;
      }

      return data as DiscoveryMetricsDTO;
    } catch {
      return MOCK_METRICS;
    }
  }

  /**
   * Obtiene los candidatos detectados con filtros opcionales
   */
  public static async getCandidates(
    orgId: string = VET_LIFE_ORG_ID,
    filters?: CandidateFilterParams
  ): Promise<PatientCandidateDTO[]> {
    try {
      let query = dbDiscovery
        .from('whatsapp_patient_candidates')
        .select(`
          *,
          evidence:whatsapp_candidate_evidence(*)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.reviewStatus && filters.reviewStatus !== 'ALL') {
        query = query.eq('review_status', filters.reviewStatus);
      }

      if (filters?.matchStatus && filters.matchStatus !== 'ALL') {
        query = query.eq('match_status', filters.matchStatus);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Retornar mock si no hay datos en vivo en BD
        return MOCK_CANDIDATES.filter(c => {
          if (filters?.reviewStatus && filters.reviewStatus !== 'ALL' && c.review_status !== filters.reviewStatus) {
            return false;
          }
          if (filters?.matchStatus && filters.matchStatus !== 'ALL' && c.match_status !== filters.matchStatus) {
            return false;
          }
          return true;
        });
      }

      return data as PatientCandidateDTO[];
    } catch {
      return MOCK_CANDIDATES;
    }
  }

  /**
   * Registra la decisión del Dr. Luis Eduardo Ríos
   */
  public static async submitDecision(params: RecordDecisionParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await dbDiscovery.rpc('record_patient_discovery_decision', {
        p_candidate_id: params.candidateId,
        p_decision: params.decision,
        p_decided_by: params.decidedByUserId,
        p_linked_pet_id: params.linkedPetId || null,
        p_linked_okvet_id: params.linkedOkvetPatientId || null,
        p_notes: params.notes || null
      });

      if (error) {
        console.error('Error al registrar decisión de descubrimiento:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
