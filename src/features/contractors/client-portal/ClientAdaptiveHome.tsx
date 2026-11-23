import React from 'react';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  HardHat, 
  CreditCard, 
  Wrench, 
  Phone 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientTab, ClientProposal, ClientChangeOrder } from './clientPortalTypes';

interface ClientAdaptiveHomeProps {
  onNavigateTab: (tab: ClientTab) => void;
  onOpenRebook: () => void;
  onOpenReschedule: () => void;
  onOpenProposal: () => void;
  onOpenChangeOrder: () => void;
  onOpenPaymentModal: () => void;
  hasActiveJob?: boolean;
  hasPendingProposal?: boolean;
  hasPendingChangeOrder?: boolean;
  hasUnpaidBalance?: boolean;
  proposal?: ClientProposal;
  changeOrder?: ClientChangeOrder;
}

export const ClientAdaptiveHome: React.FC<ClientAdaptiveHomeProps> = ({
  onNavigateTab,
  onOpenRebook,
  onOpenReschedule,
  onOpenProposal,
  onOpenChangeOrder,
  onOpenPaymentModal,
  hasActiveJob = true,
  hasPendingProposal = true,
  hasPendingChangeOrder = true,
  hasUnpaidBalance = true,
  proposal,
  changeOrder,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();

  return (
    <div className="space-y-6">
      {/* 1. ADAPTIVE HERO BANNER */}
      {hasPendingChangeOrder && changeOrder ? (
        // Priority 1: Pending Change Order (Critical Approval Required)
        <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Acción Requerida · Orden de Cambio' : 'Approval Required · Change Order'}</span>
            </Badge>
            <span className="text-xs font-mono text-slate-400">{changeOrder.changeOrderNumber}</span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{changeOrder.title}</h2>
            <p className="text-xs text-slate-300 line-clamp-2 mt-1">{changeOrder.description}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">{lang === 'es' ? 'Costo Adicional:' : 'Additional Cost:'}</span>
              <strong className="text-amber-400 font-mono text-sm">+{formatMoney(changeOrder.additionalCostUSD)}</strong>
            </div>
            <Button
              onClick={onOpenChangeOrder}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
            >
              <span>{lang === 'es' ? 'Revisar & Aprobar' : 'Review & Approve'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : hasActiveJob ? (
        // Priority 2: Active Job In Progress (Live Field Milestones)
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {lang === 'es' ? 'Obra en Ejecución' : 'Service In Progress'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">JOB-2611-9921</span>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              {lang === 'es'
                ? 'Instalación y Puesta en Marcha Chillers 50 Toneladas'
                : 'Commercial Rooftop Inverter Heat Pump Installation'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="line-clamp-1">1200 Brickell Ave, Suite 1400, Miami, FL</span>
            </div>
          </div>

          {/* Technician En-Route & Arrival Status Card */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Carlos Henao (Lead Tech)</span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {lang === 'es' ? 'En sitio · Pruebas de Presión 45 PSI' : 'On-Site · 45 PSI Pressure Testing'}
                </span>
              </div>
            </div>

            <a
              href="tel:+13055558877"
              className="p-2 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Call Lead Tech"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* 5-Step Visual Timeline */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
              <span className="text-emerald-400 font-semibold">{lang === 'es' ? 'Fase: Montaje & Vacío' : 'Stage: Mechanical Vacuum'}</span>
              <span>75% {lang === 'es' ? 'completado' : 'done'}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full w-3/4 rounded-full transition-all duration-500" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('ACTIVITY')}
              className="text-xs text-slate-300 hover:text-white p-0 h-auto"
            >
              {lang === 'es' ? 'Ver Bóveda de Fotos Antes / Después' : 'View Before / After Photo Vault'} →
            </Button>

            <Button
              size="sm"
              onClick={onOpenPaymentModal}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Pagar Saldo' : 'Pay Balance'}</span>
            </Button>
          </div>
        </div>
      ) : hasPendingProposal ? (
        // Priority 3: Pending Proposal
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-semibold">
            {lang === 'es' ? 'Presupuesto Listo para Revisar' : 'Estimate Ready for Review'}
          </Badge>
          <h2 className="text-lg font-bold text-white">
            {lang === 'es' ? 'Propuesta: Reparación de Climatización & Mantenimiento' : 'Proposal: AC System Restoration & Tune-Up'}
          </h2>
          <p className="text-xs text-slate-300">
            {lang === 'es'
              ? 'Compara las 3 opciones (Básica, Recomendada y Premium) con firma digital en 1 toque.'
              : 'Compare 3 Good / Better / Best tiered options and approve with digital signature.'}
          </p>
          <Button
            onClick={onOpenProposal}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 shadow-md shadow-amber-500/20"
          >
            {lang === 'es' ? 'Comparar Opciones & Firmar' : 'Compare Options & Sign'}
          </Button>
        </div>
      ) : null}

      {/* 2. UNIVERSAL QUICK ACTION GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Quick Action 1: Book New Service */}
        <button
          onClick={() => onNavigateTab('BOOK')}
          className="bg-slate-900 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-left space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-white block group-hover:text-amber-400 transition-colors">
              {lang === 'es' ? 'Agendar Obra' : 'Book Service'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {lang === 'es' ? 'Nuevo servicio' : 'New request'}
            </span>
          </div>
        </button>

        {/* Quick Action 2: 1-Click Rebook */}
        <button
          onClick={onOpenRebook}
          className="bg-slate-900 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-left space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-white block group-hover:text-emerald-400 transition-colors">
              {lang === 'es' ? 'Repetir Servicio' : 'Book Again'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {lang === 'es' ? 'Mismo trabajo' : 'Previous service'}
            </span>
          </div>
        </button>

        {/* Quick Action 3: Review Quotes */}
        <button
          onClick={onOpenProposal}
          className="bg-slate-900 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-left space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-white block group-hover:text-purple-400 transition-colors">
              {lang === 'es' ? 'Mis Cotizaciones' : 'My Estimates'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {lang === 'es' ? '1 pendiente' : '1 pending'}
            </span>
          </div>
        </button>

        {/* Quick Action 4: AI Concierge */}
        <button
          onClick={() => onNavigateTab('MESSAGES')}
          className="bg-slate-900 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-left space-y-2 group shadow-md"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-xs text-white block group-hover:text-blue-400 transition-colors">
              {lang === 'es' ? 'Concierge IA' : 'AI Concierge'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {lang === 'es' ? 'Asistencia 24/7' : '24/7 Help'}
            </span>
          </div>
        </button>
      </div>

      {/* 3. ACTIVE MAINTENANCE MEMBERSHIP STRIP */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white block">
                {lang === 'es' ? 'Membresía VIP Comfort Care' : 'VIP Comfort Care Plan'}
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] py-0">
                {lang === 'es' ? 'ACTIVA' : 'ACTIVE'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'es'
                ? '1 de 2 visitas de afinación anuales utilizadas. Próxima: Abril 2027.'
                : '1 of 2 annual seasonal tune-ups used. Next due: April 2027.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('ACCOUNT')}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0"
        >
          {lang === 'es' ? 'Ver Plan' : 'View Plan'} →
        </button>
      </div>

      {/* 4. RECENT COMPLETED SERVICE & LIFETIME RETENTION */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
              {lang === 'es' ? 'Último Servicio Completado' : 'Recent Completed Service'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">15 Nov 2026</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-white">
              {lang === 'es'
                ? 'Mantenimiento Preventivo & Cambio de Filtros MERV 13'
                : 'Preventive HVAC Coil Cleansing & MERV 13 Filter Replacement'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                {lang === 'es' ? 'Garantía Activa de 2 Años' : '2-Year Workmanship Warranty Active'}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onOpenRebook}
            variant="outline"
            className="border-slate-700 text-amber-400 hover:bg-slate-800 text-xs gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Reagendar este Servicio' : 'Rebook this Service'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
