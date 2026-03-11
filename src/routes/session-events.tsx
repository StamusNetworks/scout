import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { TransactionsPage } from '@/pages/transactions';

export const Route = createFileRoute('/session-events')({
  component: () => (
    <PageBoundary key="session-events">
      <TransactionsPage />
    </PageBoundary>
  ),
});
