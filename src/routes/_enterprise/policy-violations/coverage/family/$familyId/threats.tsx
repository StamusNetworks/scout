import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyThreatsList } from '@/features/threats/common/templates/family-by-id/family-by-id.threats';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId/threats',
)({
  component: () => (
    <PageBoundary key="pv-family-threats">
      <ThreatFamilyThreatsList />
    </PageBoundary>
  ),
});
