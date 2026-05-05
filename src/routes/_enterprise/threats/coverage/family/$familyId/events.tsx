import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { FamilyEvents } from '@/features/threats/components/family-events/family-events';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/events',
)({
  component: () => (
    <PageBoundary key="threat-family-events">
      <FamilyEvents />
    </PageBoundary>
  ),
});
