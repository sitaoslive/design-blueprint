/**
 * VET FREEDOM OS — ADAPTADOR DE EVENTOS DE DESPACHO Y TEMPORIZACIÓN DE VISITAS
 * Conecta los componentes de Lovable UI con el backend de Antigravity en Supabase
 * RPC: public.record_visit_timing_event
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 * Fecha: 22 de Noviembre de 2026
 */

import { supabase } from '@/integrations/supabase/client';

export type VisitTimingEventType =
  | 'TRAVEL_STARTED'
  | 'ARRIVED'
  | 'SERVICE_STARTED'
  | 'ESTIMATED_FINISH_UPDATED'
  | 'SERVICE_FINISHED';

export interface RecordVisitTimingParams {
  visitId: string;
  eventType: VisitTimingEventType;
  eventTimestamp?: string;
  estimatedFinishAt?: string;
  performedBy?: string;
  notes?: string;
}

export interface VisitTimingResult {
  success: boolean;
  eventId?: string;
  visitId: string;
  eventType: VisitTimingEventType;
  recordedAt: string;
  error?: string;
}

export class TimingAdapter {
  /**
   * Registra un cambio de temporización en la visita en vivo y lo sincroniza con Antigravity Supabase
   */
  public static async recordEvent(params: RecordVisitTimingParams): Promise<VisitTimingResult> {
    const timestamp = params.eventTimestamp || new Date().toISOString();
    const performer = params.performedBy || '11111111-1111-1111-1111-000000000001';

    try {
      const { data, error } = await supabase.rpc('record_visit_timing_event', {
        p_visit_id: params.visitId,
        p_event_type: params.eventType,
        p_event_timestamp: timestamp,
        p_estimated_finish_at: params.estimatedFinishAt || null,
        p_performed_by: performer
      });

      if (error) {
        console.warn('Fallo al invocar record_visit_timing_event en Supabase:', error.message);
        return {
          success: false,
          visitId: params.visitId,
          eventType: params.eventType,
          recordedAt: timestamp,
          error: error.message
        };
      }

      return {
        success: true,
        eventId: (data as any)?.event_id || (data as any)?.id,
        visitId: params.visitId,
        eventType: params.eventType,
        recordedAt: timestamp
      };
    } catch (err: any) {
      console.warn('Excepción en TimingAdapter.recordEvent:', err);
      return {
        success: false,
        visitId: params.visitId,
        eventType: params.eventType,
        recordedAt: timestamp,
        error: err.message || 'Error de red o conexión'
      };
    }
  }
}
