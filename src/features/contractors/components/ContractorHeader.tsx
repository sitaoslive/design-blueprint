import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { 
  Wrench, 
  Users, 
  Briefcase, 
  ArrowLeft, 
  PlusCircle, 
  PhoneCall, 
  CheckCircle2, 
  DollarSign,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContractorHeaderProps {
  onNewLeadClick?: () => void;
  activeLeadsCount?: number;
  activeJobsCount?: number;
}

export const ContractorHeader: React.FC<ContractorHeaderProps> = ({
  onNewLeadClick,
  activeLeadsCount = 4,
  activeJobsCount = 3,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

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
                  <span className="font-bold text-lg tracking-tight text-white">CONTRACTOR OS</span>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                    Alpha Service OS
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">Plataforma Operativa de Obras & Cuadrillas</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/contractors/leads"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath.includes('/leads')
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Prospectos (Leads)</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300">
                {activeLeadsCount}
              </span>
            </Link>

            <Link
              to="/contractors/jobs"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath.includes('/jobs')
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Obras en Curso</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
                {activeJobsCount}
              </span>
            </Link>

            <Link
              to="/contractors/estimates/new"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath.includes('/estimates')
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Cotizador</span>
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {onNewLeadClick && (
              <Button
                onClick={onNewLeadClick}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-md shadow-amber-500/20"
                size="sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Prospecto</span>
              </Button>
            )}

            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Super Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
