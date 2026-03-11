import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatByIdEventsPage } from '@/pages/threats/coverage/threat/events';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/threat/$threatId/events',
)({
  component: () => (
    <PageBoundary key="threat-by-id-events">
      <ThreatByIdEventsPage />
    </PageBoundary>
  ),
});
