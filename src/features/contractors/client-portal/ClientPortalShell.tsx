import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Home, 
  CalendarPlus, 
  Activity, 
  MessageSquare, 
  User, 
  WifiOff, 
  Download, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  HardHat 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientTab } from './clientPortalTypes';

interface ClientPortalShellProps {
  activeTab: ClientTab;
  onTabChange: (tab: ClientTab) => void;
  pendingActionsCount?: number;
  children: React.ReactNode;
}

export const ClientPortalShell: React.FC<ClientPortalShellProps> = ({
  activeTab,
  onTabChange,
  pendingActionsCount = 1,
  children,
}) => {
  const { lang, setLang, currency, setCurrency, t } = useContractorI18n();
  const [isOnline, setIsOnline] = useState(true);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show PWA banner if not dismissed before
    const pwaDismissed = localStorage.getItem('client_pwa_dismissed');
    if (!pwaDismissed) {
      setShowPwaBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dismissPwaBanner = () => {
    setShowPwaBanner(false);
    localStorage.setItem('client_pwa_dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 select-none">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-red-500/20 border-b border-red-500/30 text-red-300 text-xs py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{lang === 'es' ? 'Modo sin conexión. Mostrando datos cacheados.' : 'Offline mode. Displaying cached service history.'}</span>
        </div>
      )}

      {/* PWA Install Promo Banner */}
      {showPwaBanner && (
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border-b border-amber-500/20 p-2.5 px-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white block">
                {lang === 'es' ? 'Instala la App en tu Celular' : 'Install App on Your Phone'}
              </span>
              <p className="text-[11px] text-slate-400">
                {lang === 'es' ? 'Acceso rápido con 1 toque sin abrir navegador.' : '1-tap access to tracking, quotes, and rebooking.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstallModal(true)}
              className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors"
            >
              {lang === 'es' ? 'Ver Cómo' : 'Install'}
            </button>
            <button onClick={dismissPwaBanner} className="text-slate-400 hover:text-white p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Client Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white block">
                  Apex Mechanical
                </span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] py-0 px-1">
                  PRO
                </Badge>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                {lang === 'es' ? 'Portal de Clientes & Servicios' : 'Customer & Field Service Hub'}
              </span>
            </div>
          </div>

          {/* Quick Controls: Currency, Language & Call */}
          <div className="flex items-center gap-2">
            {/* Currency Picker */}
            <div className="hidden xs:inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px] font-bold">
              {(['USD', 'CAD', 'COP'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    currency === curr
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Language Switcher */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  lang === 'es'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ES
              </button>
            </div>

            {/* Direct Call Button */}
            <a
              href="tel:+13055558877"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
              title={lang === 'es' ? 'Llamar a Contratista' : 'Call Contractor'}
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Dynamic View Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Consumer App Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-2">
          {/* 1. Home */}
          <button
            onClick={() => onTabChange('HOME')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative py-1 ${
              activeTab === 'HOME'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{lang === 'es' ? 'Inicio' : 'Home'}</span>
            {activeTab === 'HOME' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          {/* 2. Book Service */}
          <button
            onClick={() => onTabChange('BOOK')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative py-1 ${
              activeTab === 'BOOK'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarPlus className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{lang === 'es' ? 'Reservar' : 'Book'}</span>
            {activeTab === 'BOOK' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          {/* 3. Activity (Jobs, Quotes, Payments) */}
          <button
            onClick={() => onTabChange('ACTIVITY')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative py-1 ${
              activeTab === 'ACTIVITY'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{lang === 'es' ? 'Actividad' : 'Activity'}</span>
            {pendingActionsCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            {activeTab === 'ACTIVITY' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          {/* 4. Messages & AI Concierge */}
          <button
            onClick={() => onTabChange('MESSAGES')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative py-1 ${
              activeTab === 'MESSAGES'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{lang === 'es' ? 'Chat & IA' : 'Messages'}</span>
            {activeTab === 'MESSAGES' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          {/* 5. Account & Properties */}
          <button
            onClick={() => onTabChange('ACCOUNT')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative py-1 ${
              activeTab === 'ACCOUNT'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{lang === 'es' ? 'Cuenta' : 'Account'}</span>
            {activeTab === 'ACCOUNT' && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* PWA Add to Home Screen Instructions Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {lang === 'es' ? 'Cómo Instalar en tu Pantalla' : 'Add to Home Screen'}
                </h3>
              </div>
              <button onClick={() => setShowInstallModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <strong className="text-white block font-semibold">📱 iPhone / iPad (Safari):</strong>
                <p className="text-slate-400">
                  {lang === 'es'
                    ? '1. Toca el botón Compartir (icono con flecha arriba).\n2. Selecciona "Agregar a Inicio".'
                    : '1. Tap the Share button in Safari.\n2. Scroll down and tap "Add to Home Screen".'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <strong className="text-white block font-semibold">🤖 Android (Chrome):</strong>
                <p className="text-slate-400">
                  {lang === 'es'
                    ? '1. Toca los 3 puntos superiores.\n2. Selecciona "Instalar Aplicación" o "Agregar a pantalla principal".'
                    : '1. Tap the 3 dots in Chrome.\n2. Tap "Install App" or "Add to Home Screen".'}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowInstallModal(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              {lang === 'es' ? 'Entendido' : 'Got it'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
