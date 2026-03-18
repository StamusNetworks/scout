import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { ThreatById } from '@/features/threats/common/templates/threat-by-id/threat-by-id';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId',
)({
  component: () => (
    <PageBoundary key="pv-by-id">
      <OutletBreadcrumb link="/policy-violations/coverage">
        Coverage
      </OutletBreadcrumb>
      <ThreatById />
    </PageBoundary>
  ),
});
