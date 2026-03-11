import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostDetails } from '@/pages/hosts/[hostId]';

export const Route = createFileRoute('/_enterprise/hosts/$hostId')({
  component: () => (
    <PageBoundary key="host-details">
      <HostDetails />
    </PageBoundary>
  ),
});
