import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatsIncidentsPage } from '@/pages/threats/incidents';

export const Route = createFileRoute(
  '/_enterprise/threats/compromises/incidents',
)({
  component: () => (
    <PageBoundary key="threats-incidents">
      <ThreatsIncidentsPage />
    </PageBoundary>
  ),
});
