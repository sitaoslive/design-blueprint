import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Building2, 
  Calendar, 
  HardHat, 
  DollarSign, 
  FileText, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from './context/ContractorI18nContext';
import { ContractorHeader } from './components/ContractorHeader';

export const ContractorSalesDemo: React.FC = () => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const demoSteps = [
    {
      step: 1,
      title: lang === 'es' ? '1. Bienvenida al Portal con Marca Propia' : '1. Branded Client PWA Home',
      role: 'CLIENT',
      description: lang === 'es' ? 'El cliente abre el enlace de la empresa en su celular. Cero logos de terceros; experiencia 100% personalizada con paleta y marca de Apex Mechanical.' : 'Client opens company link on phone. Zero third-party CRM branding; 100% white-labeled experience.',
      actionLabel: lang === 'es' ? 'Simular: Cliente Solicita Servicio →' : 'Simulate: Client Requests Service →',
    },
    {
      step: 2,
      title: lang === 'es' ? '2. Agendamiento Inteligente en 8 Pasos' : '2. 8-Step Intelligent Booking',
      role: 'CLIENT',
      description: lang === 'es' ? 'El cliente selecciona HVAC Comercial, adjunta fotos de la alarma del chiller y elige ventana de llegada sin fricción.' : 'Client selects Commercial HVAC, uploads chiller symptom photo, and confirms arrival window.',
      actionLabel: lang === 'es' ? 'Simular: Dueño Recibe Notificación en Despacho →' : 'Simulate: Owner Receives In Dispatch →',
    },
    {
      step: 3,
      title: lang === 'es' ? '3. Despacho y Asignación de Técnico' : '3. Owner Dispatch & Worker Assignment',
      role: 'OWNER',
      description: lang === 'es' ? 'El contratista asigna a Carlos Mario Henao (Field Master Tech) con 1 clic en el tablero Kanban.' : 'Contractor assigns Carlos Mario Henao (Lead Tech) with 1 click in Kanban schedule.',
      actionLabel: lang === 'es' ? 'Simular: Técnico Marca "En Camino" →' : 'Simulate: Worker Marks En Route →',
    },
    {
      step: 4,
      title: lang === 'es' ? '4. Técnico en Camino con Privacidad Protegida' : '4. En-Route Notification & Privacy',
      role: 'WORKER',
      description: lang === 'es' ? 'El cliente ve la ventana estimada de llegada (15-25 min) y teléfono de oficina sin exponer la ubicación GPS personal del trabajador.' : 'Client sees 15-25 min arrival window and office line without exposing raw worker GPS.',
      actionLabel: lang === 'es' ? 'Simular: Técnico Inicia Inspección →' : 'Simulate: Worker Begins Inspection →',
    },
    {
      step: 5,
      title: lang === 'es' ? '5. Cotización Digital Bueno / Mejor / Excelente' : '5. Tiered Good / Better / Best Proposal',
      role: 'OWNER',
      description: lang === 'es' ? 'El contratista envía propuesta de 3 niveles para la modernización VFD. El cliente compara partidas y hace preguntas en el chat.' : 'Contractor delivers 3-tier VFD retrofit proposal. Client compares scope and asks questions in-app.',
      actionLabel: lang === 'es' ? 'Simular: Cliente Firma Digitalmente Nivel "Mejor" →' : 'Simulate: Client Digitally Signs "Better" Tier →',
    },
    {
      step: 6,
      title: lang === 'es' ? '6. Orden de Cambio en Sitio con Foto de Evidencia' : '6. On-Site Change Order with Photo Evidence',
      role: 'WORKER',
      description: lang === 'es' ? 'Durante la prueba a 45 PSI se descubre fisura en válvula. El cliente aprueba +$480 USD en 1 toque tras ver la foto del daño.' : 'Hydrostatic test reveals cracked valve. Client approves +$480 USD in 1 tap after reviewing evidence photo.',
      actionLabel: lang === 'es' ? 'Simular: Obra Culminada & Acta de Entrega →' : 'Simulate: Job Completed & Certificate Signed →',
    },
    {
      step: 7,
      title: lang === 'es' ? '7. Pago de Saldo en Línea (Stripe / Interac / Nequi)' : '7. Seamless Online Checkout',
      role: 'CLIENT',
      description: lang === 'es' ? 'El cliente cancela el saldo final ($2,792.50 USD) en 30 segundos. El balance se actualiza a $0 y se descarga el recibo oficial.' : 'Client pays outstanding balance ($2,792.50 USD) in 30 seconds. Balance clears to $0 with verified receipt.',
      actionLabel: lang === 'es' ? 'Simular: Expediente Property Passport & Reagendamiento →' : 'Simulate: Property Passport & Rebooking →',
    },
    {
      step: 8,
      title: lang === 'es' ? '8. Fidelización de Por Vida & Reagendamiento 1-Toque' : '8. Lifetime Retention & 1-Tap Rebooking',
      role: 'CLIENT',
      description: lang === 'es' ? 'El predio queda registrado en el Property Passport con garantías activas y recordatorio para el mantenimiento estacional de primavera.' : 'Property is permanently registered in Property Passport with active warranties and spring tune-up reminder.',
      actionLabel: lang === 'es' ? 'Reiniciar Demostración Comercial' : 'Restart Commercial Sales Demo',
    },
  ];

  const activeStepObj = demoSteps.find((s) => s.step === currentStep) || demoSteps[0]!;

  const handleNextStep = () => {
    if (currentStep < demoSteps.length) {
      setCurrentStep(currentStep + 1);
      toast.success(
        lang === 'es' ? `Transición a Paso ${currentStep + 1}` : `Transitioning to Step ${currentStep + 1}`
      );
    } else {
      setCurrentStep(1);
      toast.info(lang === 'es' ? 'Demostración reiniciada' : 'Sales demo reset to Step 1');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ContractorHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Synthetic Demo Header Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Play className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">
                {lang === 'es' ? 'DEMO INTERACTIVA DE VENTAS (5 MINUTOS)' : 'CONTRACTOR 5-MINUTE SALES DEMO'}
              </span>
              <span className="text-slate-400">
                {lang === 'es'
                  ? 'Modo sintético aislado: Simula el ciclo completo de un cliente real sin cobrar fondos reales.'
                  : 'Isolated synthetic preview: Walks prospective contractor buyers through complete customer journey.'}
              </span>
            </div>
          </div>

          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold shrink-0">
            SYNTHETIC DATA
          </Badge>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {demoSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                currentStep === s.step
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                  : currentStep > s.step
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span className="text-xs block">Paso {s.step}</span>
            </button>
          ))}
        </div>

        {/* Active Step Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    activeStepObj.role === 'CLIENT'
                      ? 'bg-blue-500/20 text-blue-300'
                      : activeStepObj.role === 'OWNER'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }
                >
                  {activeStepObj.role === 'CLIENT'
                    ? 'PERSPECTIVA: CLIENTE'
                    : activeStepObj.role === 'OWNER'
                    ? 'PERSPECTIVA: CONTRATISTA'
                    : 'PERSPECTIVA: TÉCNICO EN CAMPO'}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Paso {activeStepObj.step} de 8</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1.5">{activeStepObj.title}</h2>
            </div>

            <Button
              onClick={handleNextStep}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>{activeStepObj.actionLabel}</span>
            </Button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{activeStepObj.description}</p>

          {/* Interactive Simulated Preview Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              {lang === 'es' ? 'Simulación en Vivo de la Interfaz:' : 'Live Interface Preview:'}
            </span>

            {activeStepObj.step === 1 && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Apex Mechanical Contractors LLC</span>
                    <span className="text-xs text-slate-400">1200 Brickell Ave · Miami, FL · HVAC Comercial</span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">● Portal Activo</Badge>
              </div>
            )}

            {activeStepObj.step === 5 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-300 block">Propuesta: Modernización VFD Inteligente</span>
                  <span className="text-[11px] text-slate-400">Nivel Recomendado · Ahorro energético estimado 28%</span>
                </div>
                <span className="text-base font-black text-white font-mono">$4,450 USD</span>
              </div>
            )}

            {activeStepObj.step === 6 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-300 block">Orden de Cambio CO-01: Reemplazo Válvula Manifold</span>
                  <span className="text-[11px] text-slate-400">Fisura descubierta en prueba hidráulica 45 PSI</span>
                </div>
                <span className="text-base font-black text-amber-400 font-mono">+$480 USD</span>
              </div>
            )}

            {activeStepObj.step === 7 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">Saldo Cancelado Exitosamente</span>
                  <span className="text-[11px] text-slate-400">Recibido vía Stripe Checkout · Referencia INV-2611-9921</span>
                </div>
                <span className="text-base font-black text-emerald-400 font-mono">$0.00 DUE</span>
              </div>
            )}

            {activeStepObj.step === 8 && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-300 block">Property Passport Actualizado</span>
                  <span className="text-[11px] text-slate-400">Carrier 50-Ton Chiller #1 & #2 con garantía hasta 2031</span>
                </div>
                <Badge className="bg-amber-500 text-slate-950 font-bold text-xs">Mantenimiento Primavera Agendable</Badge>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
