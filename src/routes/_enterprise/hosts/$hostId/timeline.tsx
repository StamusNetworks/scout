import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostTimeline } from '@/pages/hosts/[hostId]/timeline';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/timeline')({
  component: () => (
    <PageBoundary key="host-timeline">
      <HostTimeline />
    </PageBoundary>
  ),
});
