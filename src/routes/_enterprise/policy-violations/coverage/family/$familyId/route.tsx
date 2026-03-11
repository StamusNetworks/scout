import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { PolicyViolationFamilyByIdPage } from '@/pages/policy-violations/coverage/family';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId',
)({
  component: () => (
    <PageBoundary key="pv-family-by-id">
      <OutletBreadcrumb link="/policy-violations/coverage">
        Coverage
      </OutletBreadcrumb>
      <PolicyViolationFamilyByIdPage />
    </PageBoundary>
  ),
});
