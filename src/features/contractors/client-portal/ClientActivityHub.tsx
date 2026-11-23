import React, { useState } from 'react';
import { 
  Briefcase, 
  Camera, 
  FileText, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Download, 
  ShieldCheck, 
  RotateCcw, 
  Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientProposal } from './clientPortalTypes';

interface ClientActivityHubProps {
  onOpenPaymentModal: () => void;
  onOpenProposal: () => void;
  onOpenRebook: () => void;
  proposal?: ClientProposal;
  isPaid?: boolean;
}

export const ClientActivityHub: React.FC<ClientActivityHubProps> = ({
  onOpenPaymentModal,
  onOpenProposal,
  onOpenRebook,
  proposal,
  isPaid = false,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [activeSubTab, setActiveSubTab] = useState<'JOBS' | 'QUOTES' | 'INVOICES' | 'HISTORY'>('JOBS');
  const [photoFilter, setPhotoFilter] = useState<'BEFORE' | 'AFTER'>('AFTER');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">
          {lang === 'es' ? 'Centro de Actividad & Historial' : 'Activity & Service Records'}
        </h2>
        <p className="text-xs text-slate-400">
          {lang === 'es'
            ? 'Supervisa órdenes en curso, fotos de evidencia, propuestas y estados de cuenta'
            : 'Track active work orders, evidence photos, proposals, and billing receipts'}
        </p>
      </div>

      {/* Subtabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none text-xs">
        {[
          { id: 'JOBS', label: lang === 'es' ? '🔨 Obra & Fotos' : '🔨 Job & Photos', badge: 'Active' },
          { id: 'QUOTES', label: lang === 'es' ? '📄 Cotizaciones' : '📄 Proposals', badge: '1' },
          { id: 'INVOICES', label: lang === 'es' ? '💳 Facturación' : '💳 Invoices', badge: isPaid ? 'Paid' : 'Due' },
          { id: 'HISTORY', label: lang === 'es' ? '📜 Historial' : '📜 History', badge: '1' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeSubTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[9px] px-1 rounded-full font-mono ${
                activeSubTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* 1. JOBS & PHOTO VAULT SUBTAB */}
      {activeSubTab === 'JOBS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-amber-400 font-semibold">JOB-2611-9921</span>
                <h3 className="font-bold text-base text-white">Commercial Rooftop Inverter Installation</h3>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                {lang === 'es' ? 'EN EJECUCIÓN' : 'IN PROGRESS'}
              </Badge>
            </div>

            {/* Photo Gallery with Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  {lang === 'es' ? 'Bóveda de Evidencia Fotográfica' : 'Photo Evidence Vault'}
                </span>

                <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setPhotoFilter('BEFORE')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      photoFilter === 'BEFORE' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Before
                  </button>
                  <button
                    onClick={() => setPhotoFilter('AFTER')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      photoFilter === 'AFTER' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    After
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 space-y-2 group">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={
                        photoFilter === 'BEFORE'
                          ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Job site"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 left-2 text-[10px] bg-slate-950/80 text-white">
                      {photoFilter}
                    </Badge>
                  </div>
                  <div className="p-2.5 text-xs text-slate-300 space-y-0.5">
                    <p className="font-medium">
                      {photoFilter === 'BEFORE'
                        ? 'Rooftop clearance prior to crane hoist'
                        : 'New chillers anchored with vibration isolation springs'}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">Today · 08:30 AM</span>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 space-y-2 group">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={
                        photoFilter === 'BEFORE'
                          ? 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Job site"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 left-2 text-[10px] bg-slate-950/80 text-white">
                      {photoFilter}
                    </Badge>
                  </div>
                  <div className="p-2.5 text-xs text-slate-300 space-y-0.5">
                    <p className="font-medium">
                      {photoFilter === 'BEFORE'
                        ? 'Hydraulic manifold connection points before piping'
                        : 'Chilled water supply header pressure tested at 45 PSI zero leaks'}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">Today · 04:45 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Certification Stamp */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'es'
                  ? 'Protocolo OSHA / Normativa Canadiense Verificado en Sitio (EPP, Pruebas de Vacío y Bloqueo).'
                  : 'OSHA & Canadian Safety Standards Certified (PPE, Lockout/Tagout, Pressure Tested).'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUOTES & PROPOSALS SUBTAB */}
      {activeSubTab === 'QUOTES' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-amber-400 font-semibold">EST-2611-001</span>
                <h3 className="font-bold text-base text-white">Commercial Inverter Multi-Zone Proposal</h3>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                AWAITING APPROVAL
              </Badge>
            </div>

            <p className="text-xs text-slate-300">
              {lang === 'es'
                ? 'Cotización formal preparada en terreno con 3 opciones escalonadas (Básica, Recomendada y Premium).'
                : 'Formal field estimate prepared on-site with 3 Good / Better / Best tiered options.'}
            </p>

            <Button
              onClick={onOpenProposal}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 shadow-md shadow-amber-500/20"
            >
              {lang === 'es' ? 'Abrir Comparador de Opciones & Firmar' : 'Open Option Comparison & Sign'}
            </Button>
          </div>
        </div>
      )}

      {/* 3. INVOICES & PAYMENTS SUBTAB */}
      {activeSubTab === 'INVOICES' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-amber-400 font-semibold">INV-2611-9921</span>
                <h3 className="font-bold text-base text-white">Project Balance Invoice</h3>
              </div>
              <Badge
                className={
                  isPaid
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs'
                }
              >
                {isPaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
              </Badge>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'es' ? 'Total Proyecto:' : 'Total Project:'}</span>
                <span className="font-mono text-white font-bold">{formatMoney(4625)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'es' ? 'Anticipo 50%:' : 'Upfront 50% Deposit:'}</span>
                <span className="font-mono text-emerald-400 font-semibold">{formatMoney(2312.5)} (PAID)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="text-slate-200 font-semibold">{lang === 'es' ? 'Saldo Restante:' : 'Remaining Balance:'}</span>
                <span className={`font-mono font-black ${isPaid ? 'text-emerald-400 line-through' : 'text-amber-400'}`}>
                  {formatMoney(isPaid ? 0 : 2312.5)}
                </span>
              </div>
            </div>

            {!isPaid ? (
              <Button
                onClick={onOpenPaymentModal}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 shadow-md shadow-amber-500/20 gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{lang === 'es' ? 'Pagar Saldo en Línea' : 'Pay Balance Online'} ({formatMoney(2312.5)})</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => toast.success(lang === 'es' ? 'Descargando Recibo PDF...' : 'Downloading PDF Receipt...')}
                className="w-full border-slate-700 text-emerald-300 hover:bg-slate-800 text-xs gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'es' ? 'Descargar Recibo / Factura Electrónica' : 'Download Paid Receipt (PDF)'}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. PAST SERVICES HISTORY SUBTAB */}
      {activeSubTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-mono text-slate-400">JOB-2611-9880</span>
              <span className="text-slate-500 font-mono">15 Nov 2026</span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">
                Preventive HVAC Coil Cleansing & MERV 13 Filter Replacement
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary Residence · Carrier Infinity 19VS Heat Pump
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="font-mono font-bold text-emerald-400">{formatMoney(180)} (Paid)</span>
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenRebook}
                className="border-slate-700 text-amber-400 hover:bg-slate-800 text-xs gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'es' ? 'Reagendar' : 'Rebook'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
