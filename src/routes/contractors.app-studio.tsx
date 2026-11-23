import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorAppStudio } from '@/features/contractors/ContractorAppStudio';
import { ContractorI18nProvider } from '@/features/contractors/context/ContractorI18nContext';

export const Route = createFileRoute('/contractors/app-studio')({
  component: ContractorAppStudioRoute,
});

function ContractorAppStudioRoute() {
  return (
    <ContractorI18nProvider>
      <ContractorAppStudio />
    </ContractorI18nProvider>
  );
}
