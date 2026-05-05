import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { BeaconingJa3sDetails } from '@/features/events';

export const Route = createFileRoute(
  '/_enterprise/analytics/beaconing/ja3s/$ja3s',
)({
  component: () => (
    <PageBoundary key="beaconing-ja3s-details">
      <BeaconingJa3sDetailPage />
    </PageBoundary>
  ),
});

function BeaconingJa3sDetailPage() {
  const { ja3s } = Route.useParams();
  return (
    <>
      <OutletBreadcrumb>{ja3s}</OutletBreadcrumb>
      <BeaconingJa3sDetails ja3s={ja3s} />
    </>
  );
}
