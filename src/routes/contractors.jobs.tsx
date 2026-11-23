import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorHeader } from '@/features/contractors/components/ContractorHeader';
import { ContractorJobsList } from '@/features/contractors/components/ContractorJobsList';
import { ContractorI18nProvider, useContractorI18n } from '@/features/contractors/context/ContractorI18nContext';

export const Route = createFileRoute('/contractors/jobs')({
  component: () => (
    <ContractorI18nProvider>
      <ContractorJobsPage />
    </ContractorI18nProvider>
  ),
});

function ContractorJobsPage() {
  const { t } = useContractorI18n();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <ContractorHeader activeLeadsCount={5} activeJobsCount={3} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t('jobs.pageTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              FEAT-CONT-JOB-001
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {t('jobs.pageDesc')}
          </p>
        </div>

        <ContractorJobsList />
      </main>
    </div>
  );
}
