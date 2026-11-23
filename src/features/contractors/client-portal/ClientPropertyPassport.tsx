import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Wrench, 
  Key, 
  ShieldCheck, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Plus, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  HardHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientProperty, ClientEquipment } from './clientPortalTypes';

interface ClientPropertyPassportProps {
  properties: ClientProperty[];
  equipmentList: ClientEquipment[];
  onOpenCareCalendar?: (propertyId: string) => void;
  onRequestService?: (propertyId: string, equipId?: string) => void;
}

export const ClientPropertyPassport: React.FC<ClientPropertyPassportProps> = ({
  properties,
  equipmentList,
  onOpenCareCalendar,
  onRequestService,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || 'p1');

  const fallbackProperty: ClientProperty = {
    id: 'p-default',
    name: 'Primary Property',
    type: 'COMMERCIAL',
    streetAddress: '1200 Brickell Ave, Suite 1400',
    city: 'Miami',
    stateProvince: 'FL',
    postalCode: '33131',
  };
  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0] || fallbackProperty;
  const propertyEquipment = equipmentList.filter((e) => e.propertyId === activeProperty.id);

  // Property health score calculation
  const criticalCount = propertyEquipment.filter((e) => e.status === 'CRITICAL').length;
  const attentionCount = propertyEquipment.filter((e) => e.status === 'NEEDS_ATTENTION').length;
  const healthScore = Math.max(70, 100 - criticalCount * 20 - attentionCount * 8);

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] font-bold">
              MY PROPERTY PASSPORT
            </Badge>
            <span className="text-xs text-slate-400">
              {lang === 'es' ? 'Expediente Técnico del Predio' : 'Comprehensive Property Asset Record'}
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            {lang === 'es' ? 'Historial & Salud del Inmueble' : 'Property Passport & Systems Health'}
          </h2>
        </div>

        {/* Property Switcher Pills */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {properties.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPropertyId(p.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedPropertyId === p.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. PROPERTY HERO HEALTH CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeProperty.streetAddress}, {activeProperty.city}, {activeProperty.stateProvince}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{activeProperty.name}</h3>
            <span className="text-xs text-slate-400 block">
              {lang === 'es' ? 'Uso:' : 'Type:'} {activeProperty.type} · {propertyEquipment.length} {lang === 'es' ? 'equipos vinculados' : 'connected equipment assets'}
            </span>
          </div>

          {/* Health Score Ring */}
          <div className="bg-slate-950/80 p-3 px-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/80 text-emerald-400 flex items-center justify-center font-black text-base font-mono">
              {healthScore}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {lang === 'es' ? 'Índice de Salud' : 'Systems Health'}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {healthScore >= 90 ? (lang === 'es' ? 'Excelente' : 'Optimal') : (lang === 'es' ? 'Requiere Atención' : 'Needs Review')}
              </span>
            </div>
          </div>
        </div>

        {/* Access Instructions & Gate Codes */}
        {activeProperty.accessInstructions && (
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
            <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-white block">
                {lang === 'es' ? 'Instrucciones de Acceso & Códigos Protegidos:' : 'Access Instructions & Secure Gate Notes:'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeProperty.accessInstructions}</p>
            </div>
          </div>
        )}

        {/* Quick Action Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
          <Button
            size="sm"
            onClick={() => onOpenCareCalendar?.(activeProperty.id)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Ver Calendario Anual de Cuidado' : 'View Property Care Calendar'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onRequestService?.(activeProperty.id)}
            className="border-slate-700 text-slate-200 hover:text-white text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Solicitar Visita' : 'Request Service Visit'}</span>
          </Button>
        </div>
      </div>

      {/* 3. CONNECTED EQUIPMENT ASSET TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>{lang === 'es' ? 'Equipos & Maquinaria Registrada' : 'Registered Equipment & Assets'}</span>
          </h4>
          <span className="text-xs text-slate-400">{propertyEquipment.length} {lang === 'es' ? 'unidades' : 'units'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {propertyEquipment.map((eq) => (
            <div
              key={eq.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white block">{eq.name}</span>
                  <span className="text-[11px] text-slate-400">{eq.equipmentType} · {eq.manufacturer}</span>
                </div>
                <Badge
                  className={
                    eq.status === 'OPERATIONAL'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : eq.status === 'NEEDS_ATTENTION'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }
                >
                  {eq.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block uppercase">Serial:</span>
                  <span className="text-slate-200 truncate block">{eq.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Filtro / Ref:</span>
                  <span className="text-slate-200 truncate block">{eq.filterSize || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 text-[11px]">
                  {lang === 'es' ? 'Próximo Servicio:' : 'Next Service:'} {eq.nextMaintenanceDue || 'En regla'}
                </span>
                <button
                  onClick={() => onRequestService?.(activeProperty.id, eq.id)}
                  className="text-amber-400 hover:text-amber-300 font-semibold text-xs flex items-center gap-1"
                >
                  <span>{lang === 'es' ? 'Pedir Mantenimiento' : 'Service'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
