import React, { useState } from 'react';
import { X, RotateCcw, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';

interface ClientRebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRebookSuccess: (booking: any) => void;
}

export const ClientRebookModal: React.FC<ClientRebookModalProps> = ({
  isOpen,
  onClose,
  onRebookSuccess,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [selectedDay, setSelectedDay] = useState<string>('Next Monday');
  const [selectedWindow, setSelectedWindow] = useState<string>('Morning (8:00 AM – 12:00 PM)');

  if (!isOpen) return null;

  const handleConfirmRebook = () => {
    const bookingNum = `BKG-2611-${Math.floor(1000 + Math.random() * 9000)}`;
    onRebookSuccess({
      bookingNumber: bookingNum,
      serviceName: 'Preventive HVAC Coil Cleansing & MERV 13 Filter Replacement',
      date: selectedDay,
      window: selectedWindow,
    });
    toast.success(
      lang === 'es' ? '¡Servicio Reagendado con Éxito!' : 'Previous Service Rebooked Successfully!',
      {
        description: `${lang === 'es' ? 'Referencia:' : 'Reference:'} ${bookingNum}`,
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {lang === 'es' ? 'Repetir Servicio Anterior' : 'Book Previous Service Again'}
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">1-Click Fast Rebooking</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prefilled Service Summary */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">{lang === 'es' ? 'Servicio:' : 'Service:'}</span>
            <Badge className="bg-slate-800 text-amber-300 text-[10px]">HVAC Maintenance</Badge>
          </div>
          <p className="font-semibold text-white">Preventive HVAC Coil Cleansing & MERV 13 Filter Replacement</p>
          <div className="flex items-center gap-1.5 text-slate-400 pt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>1200 Brickell Ave, Suite 1400, Miami, FL</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-slate-400">{lang === 'es' ? 'Tarifa actual:' : 'Current service price:'}</span>
            <strong className="text-emerald-400 font-mono">{formatMoney(180)}</strong>
          </div>
        </div>

        {/* Slot Selector */}
        <div className="space-y-3">
          <span className="text-xs text-slate-300 font-medium block">
            {lang === 'es' ? 'Selecciona tu fecha conveniente:' : 'Choose your preferred slot:'}
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Next Monday', 'Next Tuesday', 'Next Wednesday', 'Next Thursday'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  selectedDay === day
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 text-xs">
            {['Morning (8:00 AM – 12:00 PM)', 'Afternoon (12:00 PM – 4:00 PM)'].map((win) => (
              <button
                key={win}
                onClick={() => setSelectedWindow(win)}
                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  selectedWindow === win
                    ? 'border-emerald-500 bg-emerald-500/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{win}</span>
                {selectedWindow === win && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            {lang === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmRebook}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'es' ? 'Confirmar y Reagendar' : 'Confirm & Rebook'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
