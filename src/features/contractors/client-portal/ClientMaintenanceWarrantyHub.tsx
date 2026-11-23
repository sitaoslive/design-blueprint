import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Sparkles, 
  Send, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientMaintenancePlan, ClientWarranty } from './clientPortalTypes';

interface ClientMaintenanceWarrantyHubProps {
  plans: ClientMaintenancePlan[];
  warranties: ClientWarranty[];
  onClaimSubmitted: (claimNumber: string) => void;
}

export const ClientMaintenanceWarrantyHub: React.FC<ClientMaintenanceWarrantyHubProps> = ({
  plans,
  warranties,
  onClaimSubmitted,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<ClientWarranty | null>(null);
  const [claimIssue, setClaimIssue] = useState('');

  const handleOpenClaim = (warr: ClientWarranty) => {
    setSelectedWarranty(warr);
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimIssue.trim()) return;

    const clmNum = `CLM-2611-${Math.floor(1000 + Math.random() * 9000)}`;
    onClaimSubmitted(clmNum);
    toast.success(
      lang === 'es' ? '¡Reclamo de Garantía Enviado con Éxito!' : 'Warranty Claim Submitted Successfully!',
      {
        description: `${lang === 'es' ? 'Caso:' : 'Case:'} ${clmNum}`,
      }
    );
    setIsClaimModalOpen(false);
    setClaimIssue('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">
          {lang === 'es' ? 'Mantenimientos & Garantías de Servicio' : 'Maintenance & Warranty Center'}
        </h2>
        <p className="text-xs text-slate-400">
          {lang === 'es'
            ? 'Supervisa tus planes de servicio recurrentes y certificados de garantía activos'
            : 'Track service memberships, seasonal tune-ups, and active warranty certificates'}
        </p>
      </div>

      {/* 1. MAINTENANCE PLANS SECTION */}
      <div className="space-y-3">
        <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>{lang === 'es' ? 'Planes de Mantenimiento Activos' : 'Active Service Plans & Memberships'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-white">{plan.planName}</h4>
                  <span className="text-[11px] text-slate-400">{plan.propertyName}</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  {plan.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>{lang === 'es' ? 'Visitas Anuales Utilizadas:' : 'Annual Tune-Ups Used:'}</span>
                  <strong className="text-amber-400 font-mono">
                    {plan.visitsUsed} of {plan.visitsTotal} {lang === 'es' ? 'visitas' : 'visits'}
                  </strong>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${(plan.visitsUsed / plan.visitsTotal) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>{lang === 'es' ? 'Próxima Renovación:' : 'Renewal Date:'}</span>
                  <span className="font-mono text-slate-300">{plan.renewalDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">✔ {lang === 'es' ? '15% Descuento en Reparaciones' : '15% Discount on Repairs'}</span>
                <span className="font-mono text-white font-bold">{formatMoney(plan.priceUSD)}/{plan.billingInterval === 'MONTHLY' ? 'mo' : 'yr'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. WARRANTIES SECTION */}
      <div className="space-y-3 pt-2">
        <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'es' ? 'Certificados de Garantía Vigentes' : 'Active Warranty Certificates'}</span>
        </h3>

        <div className="space-y-3">
          {warranties.map((warr) => (
            <div
              key={warr.id}
              className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-400 font-semibold">{warr.code}</span>
                  <Badge className="bg-slate-800 text-slate-300 text-[10px]">{warr.warrantyType}</Badge>
                </div>
                <h4 className="font-bold text-sm text-white">{warr.coverageTitle}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{warr.termsSummary}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                  <span>{lang === 'es' ? 'Válida hasta:' : 'Valid until:'} {warr.endDate}</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenClaim(warr)}
                className="border-slate-700 text-amber-400 hover:bg-slate-800 text-xs shrink-0 self-start sm:self-auto"
              >
                {lang === 'es' ? 'Hacer Reclamo' : 'File Claim'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* WARRANTY CLAIM MODAL */}
      {isClaimModalOpen && selectedWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {lang === 'es' ? 'Radicar Reclamo de Garantía' : 'Submit Warranty Claim'}
                </h3>
              </div>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-mono">{selectedWarranty.code}</span>
              <p className="font-semibold text-white">{selectedWarranty.coverageTitle}</p>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  {lang === 'es' ? 'Describe el problema observado *' : 'Describe the issue or malfunction *'}
                </label>
                <Textarea
                  required
                  rows={3}
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  placeholder={
                    lang === 'es'
                      ? 'Ej. El compresor reemplazado hace 3 meses dejó de encender y muestra código E4...'
                      : 'e.g. Compressor replaced 3 months ago is not starting and throwing code E4...'
                  }
                  className="bg-slate-950 border-slate-800 text-white text-xs resize-none placeholder:text-slate-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'Enviar Reclamo' : 'Submit Claim'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
