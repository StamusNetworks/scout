import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { BeaconingPage } from '@/pages/analytics/beaconing';
import { BeaconingIps } from '@/pages/analytics/beaconing-ips';

export const Route = createFileRoute('/_enterprise/analytics/beaconing/ips/')({
  component: () => (
    <BeaconingPage>
      <PageBoundary key="beaconing-ips">
        <BeaconingIps />
      </PageBoundary>
    </BeaconingPage>
  ),
});
