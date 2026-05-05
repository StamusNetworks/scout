import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { FamilyThreats } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/threats',
)({
  component: () => (
    <PageBoundary key="threat-family-threats">
      <FamilyThreats />
    </PageBoundary>
  ),
});
