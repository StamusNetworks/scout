import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostsPage } from '@/pages/hosts';

export const Route = createFileRoute('/_enterprise/hosts/')({
  component: () => (
    <PageBoundary key="hosts">
      <HostsPage />
    </PageBoundary>
  ),
});
