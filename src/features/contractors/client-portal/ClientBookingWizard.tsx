import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Mic, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientProperty } from './clientPortalTypes';

interface ClientBookingWizardProps {
  properties: ClientProperty[];
  onBookingConfirmed: (booking: any) => void;
  onCancel: () => void;
}

export const ClientBookingWizard: React.FC<ClientBookingWizardProps> = ({
  properties,
  onBookingConfirmed,
  onCancel,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();

  // Wizard State
  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<string>('HVAC');
  const [serviceName, setServiceName] = useState<string>('HVAC Diagnostic & Repair');
  const [description, setDescription] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || 'p1');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [urgency, setUrgency] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ROUTINE');
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow');
  const [selectedWindow, setSelectedWindow] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [confirmedBookingNumber, setConfirmedBookingNumber] = useState<string>('');

  const services = [
    { id: 'HVAC', title: lang === 'es' ? 'Climatización & HVAC' : 'Heating & Air Conditioning', desc: 'Repair, seasonal maintenance, condenser replacement' },
    { id: 'PLUMBING', title: lang === 'es' ? 'Plomería & Drenajes' : 'Plumbing & Drainage', desc: 'Leak detection, water heaters, pipe replacements' },
    { id: 'ELECTRICAL', title: lang === 'es' ? 'Electricidad & Iluminación' : 'Electrical & Panels', desc: 'Panel upgrades, breaker diagnostics, rewiring' },
    { id: 'ROOFING', title: lang === 'es' ? 'Tejados & Cubiertas' : 'Roofing & Waterproofing', desc: 'Leak inspection, shingle/TPO replacement' },
    { id: 'PAINTING', title: lang === 'es' ? 'Pintura & Acabados' : 'Painting & Drywall', desc: 'Interior & exterior commercial coating' },
    { id: 'REMODEL', title: lang === 'es' ? 'Remodelación General' : 'General Remodeling', desc: 'Kitchen, bathroom, framing & tenant improvements' },
  ];

  const diagnosticFee = urgency === 'EMERGENCY' ? 149 : 99;

  const handleNext = () => {
    if (step === 2 && !description.trim()) {
      toast.error(lang === 'es' ? 'Por favor describe brevemente el requerimiento' : 'Please briefly describe the issue');
      return;
    }
    if (step === 7) {
      // Authoritative Confirmation
      const bkgNum = `BKG-2611-${Math.floor(1000 + Math.random() * 9000)}`;
      setConfirmedBookingNumber(bkgNum);
      const newBooking = {
        bookingNumber: bkgNum,
        serviceType,
        serviceName,
        description,
        propertyId: selectedPropertyId,
        urgency,
        selectedDate,
        selectedWindow,
        diagnosticFee,
      };
      onBookingConfirmed(newBooking);
      setStep(8);
      toast.success(
        lang === 'es' ? '¡Cita Confirmada con Éxito!' : 'Appointment Confirmed Successfully!',
        { description: `${lang === 'es' ? 'Referencia:' : 'Reference:'} ${bkgNum}` }
      );
      return;
    }
    setStep((prev) => Math.min(prev + 1, 8));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-2xl mx-auto">
      {/* Wizard Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-amber-400 uppercase tracking-wider">
            {lang === 'es' ? `Paso ${step} de 8` : `Step ${step} of 8`}
          </span>
          <span>
            {step === 1 && (lang === 'es' ? 'Seleccionar Oficio' : 'Select Trade')}
            {step === 2 && (lang === 'es' ? 'Detalles del Trabajo' : 'Describe Issue')}
            {step === 3 && (lang === 'es' ? 'Confirmar Propiedad' : 'Confirm Property')}
            {step === 4 && (lang === 'es' ? 'Nivel de Urgencia' : 'Urgency Level')}
            {step === 5 && (lang === 'es' ? 'Ventana de Llegada' : 'Arrival Window')}
            {step === 6 && (lang === 'es' ? 'Términos & Tarifa' : 'Review & Terms')}
            {step === 7 && (lang === 'es' ? 'Confirmación Final' : 'Final Booking')}
            {step === 8 && (lang === 'es' ? '¡Confirmada!' : 'Confirmed!')}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'es' ? '¿Qué servicio requieres?' : 'What service do you need?'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Selecciona la especialidad técnica requerida' : 'Choose your trade specialty'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((srv) => (
              <button
                key={srv.id}
                onClick={() => {
                  setServiceType(srv.id);
                  setServiceName(srv.title);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
                  serviceType === srv.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">{srv.title}</span>
                  {serviceType === srv.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">{srv.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: DESCRIBE ISSUE & PHOTOS */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'es' ? 'Describe el requerimiento' : 'Describe the Issue'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Describe ruidos, fugas, códigos de falla o requerimientos' : 'Provide symptoms, error codes or scope details'}
            </p>
          </div>

          <Textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              lang === 'es'
                ? 'Ej. El equipo central no enfría en el segundo piso. La unidad exterior hace un ruido de zumbido...'
                : 'e.g. AC unit is blowing ambient air on 2nd floor, outdoor condenser fan is humming...'
            }
            className="bg-slate-950 border-slate-800 text-white text-xs resize-none placeholder:text-slate-500"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info(lang === 'es' ? 'Foto adjunta simulada' : 'Photo attachment simulated')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>{lang === 'es' ? '+ Adjuntar Foto' : '+ Attach Photo'}</span>
            </button>

            <button
              onClick={() => toast.info(lang === 'es' ? 'Nota de voz grabada simulada' : 'Voice note simulated')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700"
            >
              <Mic className="w-4 h-4 text-blue-400" />
              <span>{lang === 'es' ? 'Nota de Voz' : 'Voice Note'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIRM PROPERTY */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'es' ? 'Ubicación de la Obra' : 'Select Service Location'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Elige una de tus propiedades registradas o agrega una nueva' : 'Choose a saved property or enter address'}
            </p>
          </div>

          <div className="space-y-2">
            {properties.map((prop) => (
              <button
                key={prop.id}
                onClick={() => setSelectedPropertyId(prop.id)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                  selectedPropertyId === prop.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{prop.name}</span>
                    <Badge className="bg-slate-800 text-slate-300 text-[10px]">{prop.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{prop.streetAddress}, {prop.city}</p>
                </div>
                {selectedPropertyId === prop.id && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: URGENCY & SAFETY */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'es' ? 'Urgencia Operativa' : 'How urgent is this?'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Casos de emergencia tienen despacho prioritario en menos de 2 horas' : 'Emergency requests trigger priority crew dispatch (< 2 hours)'}
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'ROUTINE',
                title: lang === 'es' ? '🟡 Estándar / Programado' : '🟡 Routine / Scheduled',
                fee: 99,
                sub: lang === 'es' ? 'Visita en los próximos días hábiles. Tarifa de diagnóstico: ' : 'Standard slot this week. Diagnostic fee: ',
              },
              {
                id: 'URGENT',
                title: lang === 'es' ? '🟠 Urgente (Mismo Día)' : '🟠 Urgent (Same-Day)',
                fee: 99,
                sub: lang === 'es' ? 'Prioridad en el día según ruta técnica. Tarifa: ' : 'Same-day schedule buffer. Diagnostic fee: ',
              },
              {
                id: 'EMERGENCY',
                title: lang === 'es' ? '🔴 EMERGENCIA INMEDIATA (< 2 Horas)' : '🔴 IMMEDIATE EMERGENCY (< 2 Hours)',
                fee: 149,
                sub: lang === 'es' ? 'Despacho directo de cuadrilla de turno. Tarifa de emergencia: ' : 'Direct on-call dispatch with priority sirens/van. Fee: ',
              },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setUrgency(u.id as any)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                  urgency === u.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{u.title}</span>
                  <span className="font-mono text-xs font-bold text-amber-400">{formatMoney(u.fee)}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{u.sub} {formatMoney(u.fee)}</p>
              </button>
            ))}
          </div>

          {urgency === 'EMERGENCY' && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {lang === 'es'
                  ? 'Si detectas olor a gas, chispas eléctricas o riesgo de inundación severa, cierra la llave principal y llama a emergencias si aplica.'
                  : 'For active gas odors, electrical sparks or severe flooding, shut off main utility valves and call local emergency services if necessary.'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: CHOOSE APPOINTMENT WINDOW */}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'es' ? 'Selecciona Fecha & Horario' : 'Select Date & Arrival Window'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Ventanas de llegada de 4 horas para precisión técnica' : '4-hour arrival windows guarantee schedule precision'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Tomorrow', 'Wednesday', 'Thursday'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                  selectedDate === d
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {[
              { id: 'MORNING', label: '8:00 AM – 12:00 PM (Morning Slot)', avail: '2 slots' },
              { id: 'AFTERNOON', label: '12:00 PM – 4:00 PM (Afternoon Slot)', avail: '1 slot' },
              { id: 'EVENING', label: '4:00 PM – 8:00 PM (Late Slot)', avail: 'Available' },
            ].map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWindow(w.id as any)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  selectedWindow === w.id
                    ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{w.label}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">{w.avail}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6: TERMS & DIAGNOSTIC COST */}
      {step === 6 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'es' ? 'Condiciones del Diagnóstico' : 'Diagnostic Fee & Terms'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Transparencia total sin cobros ocultos' : '100% transparent pricing before technician dispatch'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>{lang === 'es' ? 'Tarifa de Diagnóstico en Sitio:' : 'On-Site Diagnostic & Trip Fee:'}</span>
              <strong className="text-amber-400 font-mono text-sm">{formatMoney(diagnosticFee)}</strong>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'es'
                ? '* Si apruebas la cotización de reparación en terreno, el 100% de la tarifa de diagnóstico se abona como crédito a tu saldo final.'
                : '* If you approve the repair estimate on-site, 100% of this diagnostic fee applies as a direct credit toward the job total.'}
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500"
              />
              <span className="text-slate-300">
                {lang === 'es' ? 'Acepto la política de cancelación (24h de aviso sin cargo)' : 'I accept the 24h free cancellation policy'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: REVIEW & CONFIRM */}
      {step === 7 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'es' ? 'Revisa tu Solicitud' : 'Review & Confirm'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Tu solicitud se enviará de inmediato al despachador de guardia' : 'Your request will be dispatched to on-call supervisor'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">{lang === 'es' ? 'Servicio:' : 'Service:'}</span>
              <span className="font-semibold text-white">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{lang === 'es' ? 'Urgencia:' : 'Urgency:'}</span>
              <span className="font-semibold text-amber-400">{urgency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{lang === 'es' ? 'Horario:' : 'Window:'}</span>
              <span className="font-semibold text-white">{selectedDate} ({selectedWindow})</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-400">{lang === 'es' ? 'Tarifa a pagar en sitio:' : 'Diagnostic Fee on-site:'}</span>
              <span className="font-mono font-bold text-emerald-400">{formatMoney(diagnosticFee)}</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 8: CONFIRMATION SUCCESS */}
      {step === 8 && (
        <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {lang === 'es' ? '¡Cita Confirmada con Éxito!' : 'Appointment Confirmed!'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'es'
                ? `Referencia: ${confirmedBookingNumber} · Un técnico será asignado en tu ventana.`
                : `Booking Reference: ${confirmedBookingNumber} · A certified technician is being dispatched.`}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 max-w-sm mx-auto">
            <div className="flex justify-between text-slate-300">
              <span>{lang === 'es' ? 'Fecha:' : 'Date:'}</span>
              <strong className="text-white">{selectedDate} ({selectedWindow})</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>{lang === 'es' ? 'Servicio:' : 'Service:'}</span>
              <strong className="text-amber-400">{serviceName}</strong>
            </div>
          </div>

          <Button
            onClick={onCancel}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5"
          >
            {lang === 'es' ? 'Volver al Inicio' : 'Back to Dashboard'}
          </Button>
        </div>
      )}

      {/* Wizard Navigation Footer */}
      {step < 8 && (
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-xs text-slate-400 hover:text-white gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Atrás' : 'Back'}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white"
            >
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleNext}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
          >
            <span>{step === 7 ? (lang === 'es' ? 'Confirmar Cita' : 'Confirm Appointment') : (lang === 'es' ? 'Siguiente' : 'Next')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
