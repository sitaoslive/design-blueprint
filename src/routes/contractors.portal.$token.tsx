import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ContractorCustomerPortal } from '@/features/contractors/components/ContractorCustomerPortal';

export const Route = createFileRoute('/contractors/portal/$token')({
  component: ContractorPortalPageRoute,
});

function ContractorPortalPageRoute() {
  const { token } = Route.useParams();
  return <ContractorCustomerPortal token={token} />;
}
