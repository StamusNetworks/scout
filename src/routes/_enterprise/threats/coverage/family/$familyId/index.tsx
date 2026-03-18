import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyDefault } from '@/features/threats/common/templates/family-by-id/family-by-id';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/',
)({
  component: () => (
    <PageBoundary key="threat-family-default">
      <ThreatFamilyDefault />
    </PageBoundary>
  ),
});
