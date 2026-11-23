import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Camera, 
  CheckCircle2, 
  Truck, 
  HardHat, 
  ChevronRight, 
  Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContractorJob, ContractorJobStatus } from '../types';
import { ContractorJobDetailModal } from './ContractorJobDetailModal';
import { useContractorI18n } from '../context/ContractorI18nContext';

const initialJobs: ContractorJob[] = [
  {
    id: 'job-501',
    organization_id: 'org-demo',
    job_number: 'JOB-2611-9921',
    customer_name: 'Apex Properties LLC (Medical Tower)',
    customer_phone: '+1 (305) 555-8877',
    customer_email: 'management@apexproperties.com',
    job_site_address: '1200 Brickell Ave, Suite 1400, Miami, FL',
    title: 'Installation & Commissioning 2x 50-Ton Rooftop Chillers',
    description: 'Rooftop crane lift, chilled water piping header connection and thermal balancing.',
    service_type: 'HVAC',
    scheduled_start: '2026-11-23T08:00:00-05:00',
    scheduled_end: '2026-11-23T17:00:00-05:00',
    status: 'IN_PROGRESS',
    crew_name: 'Alpha Crew (Lead Tech Carlos Henao & Mateo)',
    total_price_cop: 18500000, // $4,625 USD
    deposit_paid_cop: 9250000,  // $2,312.50 USD
    balance_due_cop: 9250000,   // $2,312.50 USD
    safety_checklist_completed: true,
    created_at: '2026-11-22T10:00:00Z',
    photos: [
      {
        id: 'p1',
        job_id: 'job-501',
        photo_type: 'BEFORE',
        storage_path: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        caption: 'Rooftop staging zone cleared prior to mobile crane hoist',
        taken_at: '2026-11-23T08:15:00Z',
      },
      {
        id: 'p2',
        job_id: 'job-501',
        photo_type: 'AFTER',
        storage_path: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        caption: 'Chillers vibration-isolated and insulated lines tested at 45 PSI',
        taken_at: '2026-11-23T16:00:00Z',
      },
    ],
  },
  {
    id: 'job-502',
    organization_id: 'org-demo',
    job_number: 'JOB-2611-9922',
    customer_name: 'Maple Leaf Bistro (Toronto Downtown)',
    customer_phone: '+1 (416) 555-1234',
    customer_email: 'ops@mapleleafbistro.ca',
    job_site_address: '450 Queen St W, Toronto, ON',
    title: 'Commercial Grease Interceptor & 4-inch Drain Line Replacement',
    description: 'Concrete trenching, 200-gal stainless interceptor placement and flow testing.',
    service_type: 'PLUMBING',
    scheduled_start: '2026-11-23T14:00:00-05:00',
    scheduled_end: '2026-11-23T19:00:00-05:00',
    status: 'EN_ROUTE',
    crew_name: 'Bravo Crew (Tech Andres & Felipe)',
    total_price_cop: 4800000,  // $1,200 USD
    deposit_paid_cop: 2400000,  // $600 USD
    balance_due_cop: 2400000,   // $600 USD
    safety_checklist_completed: true,
    created_at: '2026-11-22T15:00:00Z',
    photos: [
      {
        id: 'p3',
        job_id: 'job-502',
        photo_type: 'BEFORE',
        storage_path: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        caption: 'Failed underground line with grease build-up and collapse',
        taken_at: '2026-11-23T14:10:00Z',
      },
    ],
  },
  {
    id: 'job-503',
    organization_id: 'org-demo',
    job_number: 'JOB-2611-9920',
    customer_name: 'Industrial Logistics Hub Houston',
    customer_phone: '+1 (713) 555-4321',
    customer_email: 'facilities@logisticslog.com',
    job_site_address: '8800 Interstate 10, Houston, TX',
    title: '6,000 sq ft TPO Membrane Commercial Roofing Waterproofing',
    description: 'Deck surface preparation, heat-welded seams and reflective solar coating.',
    service_type: 'ROOFING',
    scheduled_start: '2026-11-20T07:00:00-05:00',
    scheduled_end: '2026-11-22T16:00:00-05:00',
    status: 'COMPLETED',
    crew_name: 'Delta Crew (Supervisor Jairo & 4 journeymen)',
    total_price_cop: 22000000, // $5,500 USD
    deposit_paid_cop: 22000000,
    balance_due_cop: 0,
    safety_checklist_completed: true,
    created_at: '2026-11-19T09:00:00Z',
    photos: [
      {
        id: 'p4',
        job_id: 'job-503',
        photo_type: 'BEFORE',
        storage_path: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        caption: 'Ponding water damage and perimeter flashing deterioration',
        taken_at: '2026-11-20T07:30:00Z',
      },
      {
        id: 'p5',
        job_id: 'job-503',
        photo_type: 'AFTER',
        storage_path: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        caption: 'Seamless membrane heat-welded with zero water ponding',
        taken_at: '2026-11-22T16:00:00Z',
      },
    ],
  },
];

export const ContractorJobsList: React.FC = () => {
  const [jobs, setJobs] = useState<ContractorJob[]>(initialJobs);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<ContractorJob | null>(null);
  const { t, formatMoney, lang } = useContractorI18n();

  const getStatusBadge = (status: ContractorJobStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{t('jobs.status.inProgress')}</Badge>;
      case 'EN_ROUTE':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{t('jobs.status.enRoute')}</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{t('jobs.status.scheduled')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{t('jobs.status.completed')}</Badge>;
      default:
        return <Badge className="bg-slate-700 text-slate-300">{status}</Badge>;
    }
  };

  const filteredJobs = statusFilter === 'ALL'
    ? jobs
    : jobs.filter((j) => j.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>{t('jobs.filterStatus')}</span>
          </div>
          {['ALL', 'IN_PROGRESS', 'EN_ROUTE', 'SCHEDULED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st === 'ALL'
                ? t('jobs.status.all')
                : st === 'IN_PROGRESS'
                ? t('jobs.status.inProgress')
                : st === 'EN_ROUTE'
                ? t('jobs.status.enRoute')
                : st === 'SCHEDULED'
                ? t('jobs.status.scheduled')
                : t('jobs.status.completed')}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          {lang === 'es' ? 'Mostrando' : 'Showing'} <strong className="text-white">{filteredJobs.length}</strong> {lang === 'es' ? 'obras activas' : 'active work orders'}
        </div>
      </div>

      {/* Jobs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg overflow-hidden flex flex-col justify-between group"
          >
            {/* Card Header */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-amber-400">
                  {job.job_number}
                </span>
                {getStatusBadge(job.status)}
              </div>

              <div>
                <h3 className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{job.customer_name}</p>
              </div>

              {/* Site Address */}
              <div className="flex items-start gap-1.5 text-xs text-slate-300 bg-slate-950/50 p-2 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{job.job_site_address}</span>
              </div>

              {/* Crew info */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <HardHat className="w-4 h-4 text-slate-500" />
                <span className="line-clamp-1 text-slate-300">{job.crew_name}</span>
              </div>

              {/* Schedule time */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {new Date(job.scheduled_start).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US')} · {new Date(job.scheduled_start).toLocaleTimeString(lang === 'es' ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Financial Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t('jobs.card.total')}</span>
                  <span className="font-mono font-semibold text-white">{formatMoney(job.total_price_cop)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t('jobs.card.balance')}</span>
                  <span className="font-mono font-semibold text-amber-400">{formatMoney(job.balance_due_cop)}</span>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>{job.photos.length} {lang === 'es' ? 'fotos registradas' : 'evidence photos'}</span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedJob(job)}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 text-xs gap-1 font-medium"
              >
                <span>{t('jobs.card.viewDetail')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ContractorJobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};
