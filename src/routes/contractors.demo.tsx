import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorSalesDemo } from '@/features/contractors/ContractorSalesDemo';
import { ContractorI18nProvider } from '@/features/contractors/context/ContractorI18nContext';

export const Route = createFileRoute('/contractors/demo')({
  ssr: false,
  component: ContractorSalesDemoRoute,
});

function ContractorSalesDemoRoute() {
  return (
    <ContractorI18nProvider>
      <ContractorSalesDemo />
    </ContractorI18nProvider>
  );
}
