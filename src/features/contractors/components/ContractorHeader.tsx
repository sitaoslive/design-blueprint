import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { 
  Wrench, 
  Users, 
  Briefcase, 
  ArrowLeft, 
  PlusCircle, 
  FileText,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContractorI18n } from '../context/ContractorI18nContext';

interface ContractorHeaderProps {
  onNewLeadClick?: () => void;
  activeLeadsCount?: number;
  activeJobsCount?: number;
}

export const ContractorHeader: React.FC<ContractorHeaderProps> = ({
  onNewLeadClick,
  activeLeadsCount = 5,
  activeJobsCount = 3,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { lang, setLang, currency, setCurrency, t } = useContractorI18n();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/contractors" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-white">{t('brand.title')}</span>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                    USA & CANADA
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">{t('brand.subtitle')}</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/contractors/leads"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentPath.includes('/leads')
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('nav.leads')}</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300">
                {activeLeadsCount}
              </span>
            </Link>

            <Link
              to="/contractors/jobs"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentPath.includes('/jobs')
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t('nav.jobs')}</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-300">
                {activeJobsCount}
              </span>
            </Link>

            <Link
              to="/contractors/estimates/new"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentPath.includes('/estimates')
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('nav.estimator')}</span>
            </Link>
          </nav>

          {/* Right Action Controls: Lang Switcher, Currency & Super Admin */}
          <div className="flex items-center gap-2.5">
            {/* Currency Picker */}
            <div className="hidden sm:inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] font-bold">
              {(['USD', 'CAD', 'COP'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 rounded transition-colors ${
                    currency === curr
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Language Switcher Pill */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English (USA / Canada)"
              >
                <span>🇺🇸 EN</span>
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  lang === 'es'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Español (Latinoamérica)"
              >
                <span>🇪🇸 ES</span>
              </button>
            </div>

            {onNewLeadClick && (
              <Button
                onClick={onNewLeadClick}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-md shadow-amber-500/20 text-xs"
                size="sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t('nav.newLead')}</span>
              </Button>
            )}

            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.superAdmin')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
