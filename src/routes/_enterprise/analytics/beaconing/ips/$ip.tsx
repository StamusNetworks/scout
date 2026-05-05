import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { BeaconingIpDetails } from '@/features/events/components/beaconing-ip-details/beaconing-ip-details';

export const Route = createFileRoute(
  '/_enterprise/analytics/beaconing/ips/$ip',
)({
  component: () => (
    <PageBoundary key="beaconing-ip-details">
      <BeaconingIpDetailPage />
    </PageBoundary>
  ),
});

function BeaconingIpDetailPage() {
  const { ip } = Route.useParams();
  return (
    <>
      <OutletBreadcrumb>{ip}</OutletBreadcrumb>
      <BeaconingIpDetails ip={ip} />
    </>
  );
}
