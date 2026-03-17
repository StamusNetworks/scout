import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { TransactionsPage } from '@/pages/transactions';

export const Route = createFileRoute('/network-events')({
  component: () => (
    <PageBoundary key="network-events">
      <TransactionsPage />
    </PageBoundary>
  ),
});
