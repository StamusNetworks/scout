import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyEvents } from '@/features/threats/common/templates/family-by-id/family-by-id.events';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/events',
)({
  component: () => (
    <PageBoundary key="threat-family-events">
      <ThreatFamilyEvents />
    </PageBoundary>
  ),
});
