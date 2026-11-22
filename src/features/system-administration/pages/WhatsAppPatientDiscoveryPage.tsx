/**
 * VET FREEDOM OS — PANEL DE DESCUBRIMIENTO Y CONCILIACIÓN DE PACIENTES CANINOS
 * Ruta: /admin/pacientes/descubrimiento
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 * Fecha: 22 de Noviembre de 2026
 */

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dog,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  FileText,
  ShieldAlert,
  RefreshCw,
  UserCheck,
  PlusCircle,
  XCircle,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { Card, PageTitle, SectionTitle, Btn, Empty } from "@/components/vf/ui";
import { useVF } from "@/lib/vf/store";
import { canAdminister } from "../domain/access";
import {
  DiscoveryMetricsDTO,
  PatientCandidateDTO,
  LuisDecisionType,
  ReviewStatusType,
  MatchStatusType
} from "../domain/discovery-contracts";
import { DiscoveryService } from "../domain/discovery-service";

export function WhatsAppPatientDiscoveryPage() {
  const roles = useVF((s) => s.roles);
  const uid = useVF((s) => s.userId);

  const [metrics, setMetrics] = useState<DiscoveryMetricsDTO | null>(null);
  const [candidates, setCandidates] = useState<PatientCandidateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterReviewStatus, setFilterReviewStatus] = useState<ReviewStatusType | 'ALL'>('PENDING_REVIEW');
  const [filterMatchStatus, setFilterMatchStatus] = useState<MatchStatusType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([
        DiscoveryService.getMetrics(),
        DiscoveryService.getCandidates('11111111-1111-1111-1111-111111111111', {
          reviewStatus: filterReviewStatus,
          matchStatus: filterMatchStatus
        })
      ]);
      setMetrics(m);
      setCandidates(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterReviewStatus, filterMatchStatus]);

  if (!canAdminister(roles, uid)) {
    return <Empty title="Panel de Descubrimiento: Acceso restringido al Dr. Luis Eduardo Ríos y Administración." />;
  }

  const handleDecision = async (
    candidateId: string,
    decision: LuisDecisionType,
    notes?: string
  ) => {
    setProcessingId(candidateId);
    try {
      const res = await DiscoveryService.submitDecision({
        candidateId,
        decision,
        decidedByUserId: (uid && !uid.startsWith('demo-')) ? uid : 'd1111111-1111-1111-1111-111111111111',
        notes: notes || 'Decisión registrada desde el panel de administración por el Dr. Luis Eduardo Ríos.'
      });

      if (res.success) {
        setActionSuccessMsg(`Decisión "${decision}" registrada exitosamente.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        await loadData();
      } else {
        alert(`Error al registrar decisión: ${res.error}`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const petName = (c.candidate_pet_name || "").toLowerCase();
    const contact = (c.contact_name || "").toLowerCase();
    const phone = c.contact_reference.toLowerCase();
    return petName.includes(q) || contact.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Encabezado */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageTitle title="Descubrimiento y Conciliación de Pacientes WhatsApp" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" /> Dr. Luis Eduardo Ríos
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold hover:bg-secondary"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Auditoría automatizada cada 5 días de conversaciones comerciales de WhatsApp autorizadas frente al snapshot de OKVET Cloud.
          Identifica posibles pacientes no registrados sin alterar historias clínicas de forma desatendida.
        </p>
      </div>

      {actionSuccessMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm font-bold text-emerald-600">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {actionSuccessMsg}
        </div>
      )}

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="p-3">
          <span className="text-xs font-medium text-muted-foreground">Posibles no registrados</span>
          <p className="mt-1 text-2xl font-black text-amber-600">
            {metrics?.potential_missing_patients ?? 0}
          </p>
          <span className="text-[10px] text-muted-foreground">Requieren alta asistida</span>
        </Card>

        <Card className="p-3">
          <span className="text-xs font-medium text-muted-foreground">Coincidencias ambiguas</span>
          <p className="mt-1 text-2xl font-black text-blue-600">
            {metrics?.ambiguous_matches ?? 0}
          </p>
          <span className="text-[10px] text-muted-foreground">Homónimos / otro perro</span>
        </Card>

        <Card className="p-3">
          <span className="text-xs font-medium text-muted-foreground">Ya registrados OKVET</span>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {metrics?.already_matched_patients ?? 0}
          </p>
          <span className="text-[10px] text-muted-foreground">Coincidencia verificada</span>
        </Card>

        <Card className="p-3">
          <span className="text-xs font-medium text-muted-foreground">Pendientes de revisión</span>
          <p className="mt-1 text-2xl font-black text-purple-600">
            {metrics?.cases_awaiting_review ?? 0}
          </p>
          <span className="text-[10px] text-muted-foreground">Por Dr. Luis</span>
        </Card>

        <Card className="p-3">
          <span className="text-xs font-medium text-muted-foreground">Casos resueltos</span>
          <p className="mt-1 text-2xl font-black text-primary">
            {metrics?.cases_resolved ?? 0}
          </p>
          <span className="text-[10px] text-muted-foreground">Histórico auditado</span>
        </Card>

        <Card className="p-3">
          <span className="text-xs font-medium text-muted-foreground">Snapshot OKVET</span>
          <div className="mt-1 flex items-center gap-1.5">
            {metrics?.okvet_snapshot_is_stale ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500">
                <AlertTriangle className="h-3.5 w-3.5" /> Antiguo (&gt;5d)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Fresco ({metrics?.total_okvet_patients_indexed ?? 0})
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {metrics?.last_okvet_snapshot_date || "Sin export"}
          </span>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterReviewStatus('PENDING_REVIEW')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filterReviewStatus === 'PENDING_REVIEW'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Pendientes ({metrics?.cases_awaiting_review ?? 0})
            </button>
            <button
              onClick={() => setFilterReviewStatus('ALL')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filterReviewStatus === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Todos los casos
            </button>
            <button
              onClick={() => setFilterReviewStatus('CONFIRMED_MISSING_REGISTERED')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filterReviewStatus === 'CONFIRMED_MISSING_REGISTERED'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Confirmados no registrados
            </button>
            <button
              onClick={() => setFilterReviewStatus('CONFIRMED_ALREADY_EXISTS')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filterReviewStatus === 'CONFIRMED_ALREADY_EXISTS'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Ya en OKVET
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar perro o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-4 text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Tarjetas de Candidatos */}
      <div className="space-y-4">
        <SectionTitle>
          Candidatos Detectados ({filteredCandidates.length})
        </SectionTitle>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Empty
            title="Sin candidatos en este filtro"
            hint="No se encontraron menciones de pacientes caninos pendientes bajo los criterios seleccionados."
          />
        ) : (
          filteredCandidates.map((cand) => (
            <Card key={cand.id} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Datos del Paciente y Contacto */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
                      <Dog className="h-3.5 w-3.5" /> CANINO
                    </span>
                    <h3 className="text-lg font-black tracking-tight">
                      {cand.candidate_pet_name || "Nombre no especificado (recuento de perros)"}
                    </h3>
                    {cand.unresolved_pet_count > 1 && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">
                        {cand.unresolved_pet_count} perros
                      </span>
                    )}

                    {/* Badge de Estado de Coincidencia */}
                    {cand.match_status === 'POTENTIAL_MISSING_PATIENT' && (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 border border-amber-500/20">
                        Posible no registrado
                      </span>
                    )}
                    {cand.match_status === 'AMBIGUOUS_MATCH' && (
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 border border-blue-500/20">
                        Coincidencia ambigua
                      </span>
                    )}
                    {cand.match_status === 'MATCHED_EXISTING' && (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                        Ya registrado OKVET
                      </span>
                    )}
                    {cand.match_status === 'OKVET_SNAPSHOT_STALE' && (
                      <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20">
                        OKVET Stale (&gt;5d)
                      </span>
                    )}

                    <span className="text-xs text-muted-foreground">
                      Confianza: {Math.round(cand.confidence_score * 100)}%
                    </span>
                  </div>

                  {/* Metadatos */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <b>Contacto:</b> {cand.contact_name || "Desconocido"} ({cand.contact_reference})
                    </span>
                    <span>
                      <b>Motivo:</b> {cand.service_intent}
                    </span>
                    {cand.mentioned_veterinarian && (
                      <span>
                        <b>Veterinario:</b> {cand.mentioned_veterinarian}
                      </span>
                    )}
                    <span>
                      <b>Fecha mensaje:</b> {new Date(cand.created_at).toLocaleDateString('es-CO')}
                    </span>
                  </div>

                  {/* Motivo de conciliación */}
                  {cand.match_reason && (
                    <p className="rounded-xl bg-secondary/50 p-2.5 text-xs text-foreground">
                      <b>Diagnóstico del motor:</b> {cand.match_reason}
                    </p>
                  )}

                  {/* Fragmento de Evidencia Sanitizado */}
                  {cand.evidence && cand.evidence.length > 0 && (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <MessageSquare className="h-3 w-3" /> Fragmento de conversación verificado (PII redactada):
                      </div>
                      <blockquote className="mt-1 text-xs italic text-muted-foreground">
                        "{cand.evidence[0].redacted_excerpt}"
                      </blockquote>
                    </div>
                  )}
                </div>

                {/* Acciones para el Dr. Luis */}
                {cand.review_status === 'PENDING_REVIEW' ? (
                  <div className="flex shrink-0 flex-col gap-2 pt-2 md:pt-0">
                    <span className="text-right text-[11px] font-bold text-muted-foreground">
                      Decisión del Dr. Luis:
                    </span>
                    <div className="flex flex-wrap gap-1.5 md:flex-col">
                      <button
                        onClick={() => handleDecision(cand.id, 'NO_ESTA_REGISTRADO')}
                        disabled={processingId === cand.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700 active:scale-95"
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> No registrado (Crear tarea)
                      </button>

                      <button
                        onClick={() => handleDecision(cand.id, 'YA_EXISTE_OKVET')}
                        disabled={processingId === cand.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-secondary active:scale-95"
                      >
                        <UserCheck className="h-3.5 w-3.5" /> Ya existe en OKVET
                      </button>

                      <button
                        onClick={() => handleDecision(cand.id, 'NO_ES_PACIENTE')}
                        disabled={processingId === cand.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95"
                      >
                        <XCircle className="h-3.5 w-3.5" /> No es paciente
                      </button>

                      <button
                        onClick={() => handleDecision(cand.id, 'PEDIR_MAS_INFO')}
                        disabled={processingId === cand.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-secondary active:scale-95"
                      >
                        <HelpCircle className="h-3.5 w-3.5" /> Pedir más info
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 rounded-2xl bg-secondary/80 p-3 text-right">
                    <span className="block text-xs font-bold text-primary">
                      {cand.review_status === 'CONFIRMED_MISSING_REGISTERED' && "✓ Tarea de registro creada"}
                      {cand.review_status === 'CONFIRMED_ALREADY_EXISTS' && "✓ Vinculado a OKVET"}
                      {cand.review_status === 'DISMISSED_NOT_A_PATIENT' && "✗ Descartado"}
                      {cand.review_status === 'POSTPONED_REVIEW_LATER' && "⏳ Pospuesto"}
                      {cand.review_status === 'MORE_INFO_REQUESTED' && "💬 Información solicitada"}
                    </span>
                    {cand.reviewed_at && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(cand.reviewed_at).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
