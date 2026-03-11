import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostIncidents } from '@/pages/hosts/[hostId]/incidents';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/incidents')({
  component: () => (
    <PageBoundary key="host-incidents">
      <HostIncidents />
    </PageBoundary>
  ),
});
