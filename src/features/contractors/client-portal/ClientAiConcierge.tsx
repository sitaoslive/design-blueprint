import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Clock, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  Phone 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useContractorI18n } from '../context/ContractorI18nContext';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'CONCIERGE';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'APPOINTMENT' | 'ESTIMATE' | 'INVOICE' | 'ESCALATION';
    title: string;
    detail: string;
    ctaLabel: string;
    onCtaClick?: () => void;
  };
}

export const ClientAiConcierge: React.FC = () => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'CONCIERGE',
      text:
        lang === 'es'
          ? '¡Hola! Soy tu Service Concierge inteligente de Apex Mechanical. Puedo informarte sobre el estado de tu técnico en camino, explicar partidas de tu cotización, gestionar citas o responder dudas sobre tus garantías.'
          : 'Hello! I am your Apex Mechanical Service Concierge. I can check your technician’s real-time arrival window, explain quote line items, schedule visits, or check your warranty certificates.',
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    lang === 'es' ? '¿A qué hora llega mi técnico?' : 'When is my technician arriving?',
    lang === 'es' ? '¿Qué incluye mi cotización?' : 'What does my quote include?',
    lang === 'es' ? '¿Cómo pago el saldo pendiente?' : 'How do I pay my remaining balance?',
    lang === 'es' ? 'Ver mis garantías activas' : 'Show my active warranties',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Simulated Role-Scoped AI Tool Call & Structured Response
    setTimeout(() => {
      let botResponse: ChatMessage;

      const lower = text.toLowerCase();
      if (lower.includes('técnico') || lower.includes('arriving') || lower.includes('lleg')) {
        // Triggered get_my_appointments tool
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'CONCIERGE',
          text:
            lang === 'es'
              ? 'Consulté la telemetría oficial de despacho: Tu orden JOB-2611-9921 está asignada al Maestro Carlos Henao. Se encuentra actualmente en terreno realizando las pruebas de presión a 45 PSI.'
              : 'I queried our live dispatch system: Work Order JOB-2611-9921 is assigned to Lead Tech Carlos Henao. He is currently on-site performing the 45 PSI nitrogen pressure certification.',
          timestamp: 'Just now',
          actionCard: {
            type: 'APPOINTMENT',
            title: 'Carlos Henao (Lead Tech)',
            detail: 'Arrival window: Active On-Site · Contact: +1 (305) 555-8877',
            ctaLabel: lang === 'es' ? 'Llamar a Cuadrilla' : 'Call Crew',
          },
        };
      } else if (lower.includes('cotiz') || lower.includes('quote') || lower.includes('estimate') || lower.includes('incluy')) {
        // Triggered get_my_estimates tool
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'CONCIERGE',
          text:
            lang === 'es'
              ? 'Tienes activa la cotización EST-2611-001 con 3 opciones escalonadas: Opción Básica ($450), Opción Recomendada ($890 con lavado de serpentín y 2 años de garantía) y Opción Premium Inverter ($2.850).'
              : 'You have estimate EST-2611-001 active with 3 options: Essential ($450), Recommended ($890 with chemical coil wash and 2-yr warranty), and Inverter Replacement ($2,850).',
          timestamp: 'Just now',
          actionCard: {
            type: 'ESTIMATE',
            title: 'EST-2611-001 · Recommended Option',
            detail: `${formatMoney(890)} · 2-Year Warranty included`,
            ctaLabel: lang === 'es' ? 'Ver y Firmar Propuesta' : 'Review & Sign Proposal',
          },
        };
      } else if (lower.includes('saldo') || lower.includes('pay') || lower.includes('pagar') || lower.includes('balance')) {
        // Triggered get_my_invoices tool
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'CONCIERGE',
          text:
            lang === 'es'
              ? 'Tu anticipo del 50% ($2.312,50 USD) fue recibido. El saldo final de 50% ($2.312,50 USD) está disponible para pago seguro en línea con tarjeta, Apple Pay o transferencia.'
              : 'Your 50% deposit ($2,312.50 USD) was cleared. The final 50% balance ($2,312.50 USD) is ready for payment via Card, Apple Pay, ACH or Interac.',
          timestamp: 'Just now',
          actionCard: {
            type: 'INVOICE',
            title: 'Invoice INV-2611-9921',
            detail: `Balance Due: ${formatMoney(2312.5)} · Final Settlement`,
            ctaLabel: lang === 'es' ? 'Pagar Saldo en Línea' : 'Pay Balance Online',
          },
        };
      } else if (lower.includes('garant') || lower.includes('warrant')) {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'CONCIERGE',
          text:
            lang === 'es'
              ? 'Cuentas con 2 garantías vigentes: 1. Garantía de Mano de Obra de 2 años (expira Noviembre 2028). 2. Garantía de Fabricante de 10 años en Compresor Carrier.'
              : 'You have 2 active warranties: 1. 2-Year Workmanship Guarantee (expires Nov 2028). 2. 10-Year Manufacturer Warranty on Carrier Compressor.',
          timestamp: 'Just now',
        };
      } else {
        // Human Escalation (§ 271)
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'CONCIERGE',
          text:
            lang === 'es'
              ? 'Comprendo tu consulta. He notificado a nuestro coordinador de operaciones para darte una respuesta personalizada inmediata.'
              : 'I have logged this inquiry and escalated it directly to our on-call operations supervisor for immediate personalized assistance.',
          timestamp: 'Just now',
          actionCard: {
            type: 'ESCALATION',
            title: 'Operations Desk Escalation',
            detail: 'Priority ticket logged · Representative phone: +1 (305) 555-8877',
            ctaLabel: lang === 'es' ? 'Llamar a Despacho' : 'Call Dispatch Desk',
          },
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-w-2xl mx-auto flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Service Concierge</h3>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] py-0">
                AI CO-PILOT
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400">
              {lang === 'es' ? 'Asistente de Servicio 24/7' : '24/7 Service & Appointment Assistant'}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500">Claude 3.5 Ready</span>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div
              className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                m.sender === 'USER'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow'
              }`}
            >
              <p>{m.text}</p>

              {/* Action Card Attachment */}
              {m.actionCard && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-400">{m.actionCard.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{m.actionCard.detail}</p>
                  <Button
                    size="sm"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold border border-slate-700 h-8"
                  >
                    {m.actionCard.ctaLabel}
                  </Button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-mono px-1">{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 shrink-0 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 shrink-0 pt-2 border-t border-slate-800"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            lang === 'es'
              ? 'Pregunta lo que sea sobre tus servicios...'
              : 'Ask anything about your service, quote or appointments...'
          }
          className="bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500"
        />
        <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
