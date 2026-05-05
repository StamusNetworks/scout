import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatEntitiesOverview } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/compromises/entities',
)({
  component: () => (
    <PageBoundary key="threats-entities">
      <ThreatEntitiesOverview kind="compromise" />
    </PageBoundary>
  ),
});
