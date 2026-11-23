import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorHeader } from '@/features/contractors/components/ContractorHeader';
import { ContractorEstimateBuilder } from '@/features/contractors/components/ContractorEstimateBuilder';
import { ContractorI18nProvider } from '@/features/contractors/context/ContractorI18nContext';

export const Route = createFileRoute('/contractors/estimates/new')({
  component: () => (
    <ContractorI18nProvider>
      <ContractorNewEstimatePage />
    </ContractorI18nProvider>
  ),
});

function ContractorNewEstimatePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <ContractorHeader activeLeadsCount={5} activeJobsCount={3} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContractorEstimateBuilder />
      </main>
    </div>
  );
}
