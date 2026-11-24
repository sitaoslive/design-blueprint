import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorCustomerPortal } from '@/features/contractors/components/ContractorCustomerPortal';
import { ContractorI18nProvider } from '@/features/contractors/context/ContractorI18nContext';

export const Route = createFileRoute('/contractors/portal/$token')({
  ssr: false,
  component: ContractorPortalPageRoute,
});

function ContractorPortalPageRoute() {
  const { token } = Route.useParams();
  return (
    <ContractorI18nProvider>
      <ContractorCustomerPortal token={token} />
    </ContractorI18nProvider>
  );
}
