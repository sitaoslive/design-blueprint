import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';

interface ClientRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescheduleSuccess: (newSlot: string) => void;
}

export const ClientRescheduleModal: React.FC<ClientRescheduleModalProps> = ({
  isOpen,
  onClose,
  onRescheduleSuccess,
}) => {
  const { lang, t } = useContractorI18n();
  const [selectedDay, setSelectedDay] = useState<string>('Friday, Nov 27');
  const [selectedWindow, setSelectedWindow] = useState<string>('1:00 PM – 5:00 PM (Afternoon)');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onRescheduleSuccess(`${selectedDay} · ${selectedWindow}`);
    toast.success(
      lang === 'es' ? '¡Cita Reprogramada con Éxito!' : 'Appointment Rescheduled Successfully!',
      {
        description: `${selectedDay} (${selectedWindow})`,
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              {lang === 'es' ? 'Reprogramar Cita' : 'Reschedule Appointment'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {lang === 'es'
              ? 'Puedes reprogramar sin cargo si avisas con al menos 24 horas de antelación.'
              : 'Free rescheduling allowed with at least 24 hours prior notice.'}
          </span>
        </div>

        <div className="space-y-3">
          <span className="text-xs text-slate-300 font-medium block">
            {lang === 'es' ? 'Selecciona una nueva fecha disponible:' : 'Select an alternative available date:'}
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Friday, Nov 27', 'Saturday, Nov 28', 'Monday, Nov 30', 'Tuesday, Dec 1'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  selectedDay === d
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 text-xs">
            {['8:00 AM – 12:00 PM (Morning)', '1:00 PM – 5:00 PM (Afternoon)'].map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWindow(w)}
                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  selectedWindow === w
                    ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{w}</span>
                {selectedWindow === w && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            {lang === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'es' ? 'Confirmar Reprogramación' : 'Confirm New Slot'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
