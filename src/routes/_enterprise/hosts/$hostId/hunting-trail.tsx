import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { HuntingTrail } from '@/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail';

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
  const { start_date, end_date } = useGlobalQueryParams(['dates']);
  return (
    <HuntingTrail
      asset={hostId}
      startDate={start_date}
      endDate={end_date}
    />
  );
}
