import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatByIdEvents } from '@/features/threats/common/templates/threat-by-id/threat-by-id.events';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId/events',
)({
  component: () => (
    <PageBoundary key="pv-by-id-events">
      <ThreatByIdEvents />
    </PageBoundary>
  ),
});
