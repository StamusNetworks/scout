import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { ThreatFamilyById } from '@/features/threats/common/templates/family-by-id/family-by-id';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId',
)({
  component: () => (
    <PageBoundary key="pv-family-by-id">
      <OutletBreadcrumb link="/policy-violations/coverage">
        Coverage
      </OutletBreadcrumb>
      <ThreatFamilyById />
    </PageBoundary>
  ),
});
