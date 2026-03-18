import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostTimeline } from '@/features/host-insights/use-cases/host-details/entities/host-timeline/host-timeline';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/timeline')({
  component: () => (
    <PageBoundary key="host-timeline">
      <HostTimelineTab />
    </PageBoundary>
  ),
});

function HostTimelineTab() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };

  return <HostTimeline hostId={hostId} />;
}
