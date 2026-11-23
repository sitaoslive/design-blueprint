import React from 'react';
import { X, AlertCircle, CheckCircle2, Clock, DollarSign, Camera, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientChangeOrder } from './clientPortalTypes';

interface ClientChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeOrder: ClientChangeOrder;
  onDecision: (decision: 'APPROVED' | 'DECLINED') => void;
}

export const ClientChangeOrderModal: React.FC<ClientChangeOrderModalProps> = ({
  isOpen,
  onClose,
  changeOrder,
  onDecision,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();

  if (!isOpen) return null;

  const handleApprove = () => {
    onDecision('APPROVED');
    toast.success(
      lang === 'es' ? '¡Orden de Cambio Aprobada!' : 'Change Order Approved!',
      {
        description: `+${formatMoney(changeOrder.additionalCostUSD)} ${lang === 'es' ? 'añadido al saldo del proyecto' : 'added to project balance'}`,
      }
    );
    onClose();
  };

  const handleDecline = () => {
    onDecision('DECLINED');
    toast.info(
      lang === 'es' ? 'Orden de cambio rechazada' : 'Change order declined'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-semibold">{changeOrder.changeOrderNumber}</span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                  {lang === 'es' ? 'PENDIENTE' : 'PENDING'}
                </Badge>
              </div>
              <h3 className="font-bold text-white text-base">{changeOrder.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-3 text-xs">
          <p className="text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            {changeOrder.description}
          </p>

          {/* Photo Evidence */}
          {changeOrder.evidencePhotoUrl && (
            <div className="space-y-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'es' ? 'Evidencia Fotográfica en Terreno:' : 'Field Photographic Evidence:'}
              </span>
              <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950">
                <img
                  src={changeOrder.evidencePhotoUrl}
                  alt="Change order evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Financial & Timeline Delta Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-0.5">
              <span className="text-[11px] text-slate-400">{lang === 'es' ? 'Costo Adicional:' : 'Additional Cost:'}</span>
              <span className="text-lg font-black text-amber-400 font-mono block">
                +{formatMoney(changeOrder.additionalCostUSD)}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-0.5">
              <span className="text-[11px] text-slate-400">{lang === 'es' ? 'Tiempo Estimado:' : 'Timeline Delta:'}</span>
              <span className="text-lg font-black text-white font-mono block">
                +{changeOrder.additionalDays} {lang === 'es' ? 'día' : 'day'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDecline}
            className="text-slate-400 hover:text-red-400 text-xs"
          >
            {lang === 'es' ? 'Rechazar Trabajo Extra' : 'Decline Extra Work'}
          </Button>

          <Button
            size="sm"
            onClick={handleApprove}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'es' ? 'Aprobar Orden de Cambio' : 'Approve Change Order'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
