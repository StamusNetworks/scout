import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { BeaconingIpDetails } from '@/pages/analytics/beaconing-ips/[ip]';

export const Route = createFileRoute(
  '/_enterprise/analytics/beaconing/ips/$ip',
)({
  component: () => (
    <PageBoundary key="beaconing-ip-details">
      <BeaconingIpDetails />
    </PageBoundary>
  ),
});
