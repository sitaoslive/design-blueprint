import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Flame, 
  DollarSign, 
  Filter, 
  Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContractorLead, ContractorPipelineStage, ContractorServiceType } from '../types';
import { ContractorNewLeadModal } from './ContractorNewLeadModal';

const initialLeads: ContractorLead[] = [
  {
    id: 'lead-101',
    organization_id: 'org-demo',
    lead_number: 'LEAD-2611-8841',
    contact_name: 'Alejandro Restrepo (Torre Poblado)',
    phone: '+573009998877',
    service_type: 'HVAC',
    urgency_level: 'EMERGENCY',
    project_address: 'Calle 10 # 43E-20, Apto 1202, Medellín',
    city: 'Medellín',
    estimated_budget_cop: 4800000,
    pipeline_stage: 'NEW',
    lead_score: 95,
    lead_source: 'WHATSAPP',
    notes: 'Fuga de refrigerante en sistema central VRF piso 12. Requiere visita prioritaria.',
    created_at: '2026-11-23T08:15:00Z',
  },
  {
    id: 'lead-102',
    organization_id: 'org-demo',
    lead_number: 'LEAD-2611-7712',
    contact_name: 'Restaurante Sabor Criollo (Gerencia)',
    phone: '+573114445566',
    service_type: 'PLUMBING',
    urgency_level: 'URGENT',
    project_address: 'Cra 35 # 8A-14, Provenza, Medellín',
    city: 'Medellín',
    estimated_budget_cop: 3200000,
    pipeline_stage: 'CONTACTED',
    lead_score: 82,
    lead_source: 'WEBSITE',
    notes: 'Trampa de grasas desbordada y cambio de tubería de 4 pulgadas cocina.',
    created_at: '2026-11-23T07:40:00Z',
  },
  {
    id: 'lead-103',
    organization_id: 'org-demo',
    lead_number: 'LEAD-2611-6639',
    contact_name: 'Clínica Odontológica DentiSalud',
    phone: '+573152223344',
    service_type: 'ELECTRICAL',
    urgency_level: 'STANDARD',
    project_address: 'Av El Poblado # 16A Sur-40, Medellín',
    city: 'Medellín',
    estimated_budget_cop: 8500000,
    pipeline_stage: 'ESTIMATE_SCHEDULED',
    lead_score: 75,
    lead_source: 'GOOGLE_LSA',
    notes: 'Actualización tablero de breakers y certificación RETIE para quirófano.',
    created_at: '2026-11-22T14:30:00Z',
  },
  {
    id: 'lead-104',
    organization_id: 'org-demo',
    lead_number: 'LEAD-2611-5520',
    contact_name: 'Bodegas Las Vegas (Ing. Mauricio)',
    phone: '+573187771122',
    service_type: 'ROOFING',
    urgency_level: 'FLEXIBLE',
    project_address: 'Autopista Sur # 65-10, Itagüí',
    city: 'Medellín',
    estimated_budget_cop: 18000000,
    pipeline_stage: 'PROPOSAL_SENT',
    lead_score: 88,
    lead_source: 'REFERRAL',
    notes: 'Impermeabilización de 600m² con manto asfáltico y tejas traslúcidas.',
    created_at: '2026-11-21T11:00:00Z',
  },
  {
    id: 'lead-105',
    organization_id: 'org-demo',
    lead_number: 'LEAD-2611-4411',
    contact_name: 'Condominio Campestre Los Álamos',
    phone: '+573205559988',
    service_type: 'GENERAL_REMODEL',
    urgency_level: 'STANDARD',
    project_address: 'Vía Las Palmas Km 9, Rionegro',
    city: 'Rionegro',
    estimated_budget_cop: 24000000,
    pipeline_stage: 'WON',
    lead_score: 98,
    lead_source: 'WHATSAPP',
    notes: 'Remodelación completa de portería y fachada social. Anticipo 50% cobrado.',
    created_at: '2026-11-20T09:00:00Z',
  },
];

const COLUMNS: { stage: ContractorPipelineStage; label: string; color: string }[] = [
  { stage: 'NEW', label: '1. Nuevos Leads', color: 'border-amber-500/40 text-amber-400' },
  { stage: 'CONTACTED', label: '2. Contactados', color: 'border-blue-500/40 text-blue-400' },
  { stage: 'ESTIMATE_SCHEDULED', label: '3. Visita Agendada', color: 'border-purple-500/40 text-purple-400' },
  { stage: 'PROPOSAL_SENT', label: '4. Cotización Enviada', color: 'border-emerald-500/40 text-emerald-400' },
  { stage: 'WON', label: '5. Ganados / Obra Aprobada', color: 'border-teal-500/40 text-teal-300' },
];

export const ContractorLeadsKanban: React.FC = () => {
  const [leads, setLeads] = useState<ContractorLead[]>(initialLeads);
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const moveLead = (leadId: string, direction: 'forward' | 'backward') => {
    const stageOrder: ContractorPipelineStage[] = [
      'NEW',
      'CONTACTED',
      'ESTIMATE_SCHEDULED',
      'PROPOSAL_SENT',
      'WON',
    ];

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const currentIndex = stageOrder.indexOf(lead.pipeline_stage);
        if (currentIndex === -1) return lead;

        const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        const targetStage = stageOrder[newIndex];
        if (!targetStage) return lead;

        return { ...lead, pipeline_stage: targetStage };
      })
    );
  };

  const handleLeadCreated = (newLead: ContractorLead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const filteredLeads = selectedService === 'ALL' 
    ? leads 
    : leads.filter((l) => l.service_type === selectedService);

  const formatCOP = (val?: number) => {
    if (!val) return '$0 COP';
    return `$${val.toLocaleString('es-CO')} COP`;
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">🔴 EMERGENCIA</Badge>;
      case 'URGENT':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">🟠 URGENTE</Badge>;
      default:
        return <Badge className="bg-slate-700 text-slate-300 text-[10px]">🟡 ESTÁNDAR</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtrar Oficio:</span>
          </div>
          {['ALL', 'HVAC', 'PLUMBING', 'ELECTRICAL', 'ROOFING', 'GENERAL_REMODEL'].map((srv) => (
            <button
              key={srv}
              onClick={() => setSelectedService(srv)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedService === srv
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {srv === 'ALL' ? 'Todos' : srv}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Building2 className="w-4 h-4" />
          <span>+ Nuevo Prospecto</span>
        </Button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.pipeline_stage === col.stage);

          return (
            <div
              key={col.stage}
              className="bg-slate-900/80 rounded-xl border border-slate-800/80 p-3.5 space-y-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className={`text-xs font-semibold tracking-wide ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-slate-850 bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 hover:border-slate-700 transition-all shadow-md group space-y-2.5"
                  >
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-mono font-medium text-slate-400">
                        {lead.lead_number}
                      </span>
                      {getUrgencyBadge(lead.urgency_level)}
                    </div>

                    {/* Customer name & Trade */}
                    <div>
                      <h4 className="font-semibold text-sm text-white group-hover:text-amber-400 transition-colors">
                        {lead.contact_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className="bg-slate-800 text-amber-300 border-slate-700 text-[10px]">
                          {lead.service_type}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Score: <strong className="text-emerald-400">{lead.lead_score}/100</strong>
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{lead.project_address}</span>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{formatCOP(lead.estimated_budget_cop)}</span>
                    </div>

                    {/* Notes preview */}
                    {lead.notes && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg">
                        "{lead.notes}"
                      </p>
                    )}

                    {/* Direct Contact Actions */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(
                            lead.contact_name
                          )},%20te%20escribimos%20de%20Alpha%20Service%20OS%20respecto%20a%20tu%20solicitud%20de%20${encodeURIComponent(
                            lead.service_type
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="Llamar directamente"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Stage Move Controls */}
                      <div className="flex items-center gap-1">
                        {col.stage !== 'NEW' && (
                          <button
                            onClick={() => moveLead(lead.id, 'backward')}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Regresar etapa"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col.stage !== 'WON' && (
                          <button
                            onClick={() => moveLead(lead.id, 'forward')}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Avanzar etapa"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="p-4 text-center rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
                    Sin prospectos en esta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ContractorNewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadCreated={handleLeadCreated}
      />
    </div>
  );
};
