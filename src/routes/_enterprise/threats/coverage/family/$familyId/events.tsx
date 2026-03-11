import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyEventsPage } from '@/pages/threats/coverage/family/events';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/events',
)({
  component: () => (
    <PageBoundary key="threat-family-events">
      <ThreatFamilyEventsPage />
    </PageBoundary>
  ),
});
