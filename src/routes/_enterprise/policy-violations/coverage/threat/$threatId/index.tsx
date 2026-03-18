import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatByIdIndex } from '@/features/threats/common/templates/threat-by-id/threat-by-id';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId/',
)({
  component: () => (
    <PageBoundary key="pv-by-id-index">
      <ThreatByIdIndex familyClass="dopv" />
    </PageBoundary>
  ),
});
