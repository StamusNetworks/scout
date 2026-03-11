import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { BeaconingPage } from '@/pages/analytics/beaconing';
import { BeaconingJa3s } from '@/pages/analytics/beaconing-ja3s';

export const Route = createFileRoute(
  '/_enterprise/analytics/beaconing/ja3s/',
)({
  component: () => (
    <BeaconingPage>
      <PageBoundary key="beaconing-ja3s">
        <BeaconingJa3s />
      </PageBoundary>
    </BeaconingPage>
  ),
});
