import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatByIdIndex } from '@/features/hunt/threats/templates/threat-by-id/threat-by-id';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/threat/$threatId/',
)({
  component: () => (
    <PageBoundary key="threat-by-id-index">
      <ThreatByIdIndex />
    </PageBoundary>
  ),
});
