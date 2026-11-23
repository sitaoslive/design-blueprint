import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorHeader } from '@/features/contractors/components/ContractorHeader';
import { ContractorEstimateBuilder } from '@/features/contractors/components/ContractorEstimateBuilder';

export const Route = createFileRoute('/contractors/estimates/new')({
  component: ContractorNewEstimatePage,
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
