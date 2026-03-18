import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostInsightsView } from '@/features/host-insights/use-cases/host-details/entities/host-insights-view/host-insights-view';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/')({
  component: () => (
    <PageBoundary key="host-insights">
      <HostInsightsTab />
    </PageBoundary>
  ),
});

function HostInsightsTab() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  return <HostInsightsView hostId={hostId} />;
}
