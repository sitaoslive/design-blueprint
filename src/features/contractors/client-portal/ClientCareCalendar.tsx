import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wrench, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { PropertyCareEntry } from './clientPortalTypes';

interface ClientCareCalendarProps {
  entries: PropertyCareEntry[];
  onBookCareEntry: (entry: PropertyCareEntry) => void;
  onBack?: () => void;
}

export const ClientCareCalendar: React.FC<ClientCareCalendarProps> = ({
  entries,
  onBookCareEntry,
  onBack,
}) => {
  const { lang, t } = useContractorI18n();
  const [selectedSeason, setSelectedSeason] = useState<'ALL' | 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER'>('ALL');

  const filteredEntries = entries.filter((e) => {
    if (selectedSeason === 'ALL') return true;
    if (selectedSeason === 'SPRING') return e.dueMonth.includes('Mar') || e.dueMonth.includes('Apr') || e.dueMonth.includes('May');
    if (selectedSeason === 'SUMMER') return e.dueMonth.includes('Jun') || e.dueMonth.includes('Jul') || e.dueMonth.includes('Aug');
    if (selectedSeason === 'FALL') return e.dueMonth.includes('Sep') || e.dueMonth.includes('Oct') || e.dueMonth.includes('Nov');
    if (selectedSeason === 'WINTER') return e.dueMonth.includes('Dec') || e.dueMonth.includes('Jan') || e.dueMonth.includes('Feb');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] font-bold">
              MY PROPERTY CARE CALENDAR
            </Badge>
            <span className="text-xs text-slate-400">
              {lang === 'es' ? 'Plan de Mantenimiento Preventivo Anual' : 'Annual Preventive Care Schedule'}
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            {lang === 'es' ? 'Calendario Anual de Cuidado' : 'Property Care Calendar'}
          </h2>
        </div>

        {/* Seasonal Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'ALL', label: lang === 'es' ? 'Todo el Año' : 'Full Year' },
            { id: 'SPRING', label: lang === 'es' ? 'Primavera' : 'Spring' },
            { id: 'SUMMER', label: lang === 'es' ? 'Verano' : 'Summer' },
            { id: 'FALL', label: lang === 'es' ? 'Otoño' : 'Fall' },
            { id: 'WINTER', label: lang === 'es' ? 'Invierno' : 'Winter' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeason(s.id as any)}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSeason === s.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CARE SCHEDULE CARDS */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => {
          const isDone = entry.status === 'COMPLETED';
          const isDue = entry.status === 'SCHEDULED';
          return (
            <div
              key={entry.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDone
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <Wrench className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{entry.title}</span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                      {entry.tradeCategory}
                    </Badge>
                    {entry.isCoveredByPlan && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                        {lang === 'es' ? 'Incluido en Membresía VIP' : 'Plan Covered'}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block">
                    {lang === 'es' ? 'Frecuencia:' : 'Cadence:'} {entry.frequency} · {lang === 'es' ? 'Mes sugerido:' : 'Suggested month:'} {entry.dueMonth}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                {isDone ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs py-1 px-2.5 gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Completado' : 'Completed'}</span>
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onBookCareEntry(entry)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Agendar con 1-Toque' : '1-Tap Book'}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
