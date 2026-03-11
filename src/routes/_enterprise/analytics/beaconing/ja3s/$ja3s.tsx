import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { BeaconingJa3sDetails } from '@/pages/analytics/beaconing-ja3s/[ja3s]';

export const Route = createFileRoute(
  '/_enterprise/analytics/beaconing/ja3s/$ja3s',
)({
  component: () => (
    <PageBoundary key="beaconing-ja3s-details">
      <BeaconingJa3sDetails />
    </PageBoundary>
  ),
});
