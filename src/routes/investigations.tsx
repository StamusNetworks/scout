import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { InvestigationsPage } from '@/pages/investigations';

export const Route = createFileRoute('/investigations')({
  component: () => (
    <PageBoundary key="investigations">
      <InvestigationsPage />
    </PageBoundary>
  ),
});
