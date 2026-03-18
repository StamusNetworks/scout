import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyEvents } from '@/features/threats/common/templates/family-by-id/family-by-id.events';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId/events',
)({
  component: () => (
    <PageBoundary key="pv-family-events">
      <ThreatFamilyEvents />
    </PageBoundary>
  ),
});
