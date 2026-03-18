import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyThreatsList } from '@/features/threats/common/templates/family-by-id/family-by-id.threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/threats',
)({
  component: () => (
    <PageBoundary key="threat-family-threats">
      <ThreatFamilyThreatsList />
    </PageBoundary>
  ),
});
