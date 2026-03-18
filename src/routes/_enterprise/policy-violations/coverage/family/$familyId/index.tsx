import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyDefault } from '@/features/threats/common/templates/family-by-id/family-by-id';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId/',
)({
  component: () => (
    <PageBoundary key="pv-family-default">
      <ThreatFamilyDefault familyClass="dopv" />
    </PageBoundary>
  ),
});
