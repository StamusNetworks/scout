import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationByIdEventsPage } from '@/pages/policy-violations/coverage/policy-violation/events';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId/events',
)({
  component: () => (
    <PageBoundary key="pv-by-id-events">
      <PolicyViolationByIdEventsPage />
    </PageBoundary>
  ),
});
