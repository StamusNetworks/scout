import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostInsights } from '@/pages/hosts/[hostId]/insights';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/')({
  component: () => (
    <PageBoundary key="host-insights">
      <HostInsights />
    </PageBoundary>
  ),
});
