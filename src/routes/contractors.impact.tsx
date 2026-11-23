import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorValueDashboard } from '@/features/contractors/ContractorValueDashboard';
import { ContractorI18nProvider } from '@/features/contractors/context/ContractorI18nContext';

export const Route = createFileRoute('/contractors/impact')({
  component: ContractorImpactRoute,
});

function ContractorImpactRoute() {
  return (
    <ContractorI18nProvider>
      <ContractorValueDashboard />
    </ContractorI18nProvider>
  );
}
