import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostHuntingTrail } from '@/features/host-insights/use-cases/host-details/entities/host-hunting-trail/host-hunting-trail';

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/hunting-trail',
)({
  component: () => (
    <PageBoundary key="host-hunting-trail">
      <HostHuntingTrailTab />
    </PageBoundary>
  ),
});

function HostHuntingTrailTab() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  return <HostHuntingTrail hostId={hostId} />;
}
