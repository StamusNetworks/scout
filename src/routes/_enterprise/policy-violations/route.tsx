import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/_enterprise/policy-violations')({
  component: () => (
    <PageBoundary key="policy-violations">
      <OutletBreadcrumb link="/policy-violations/violations">
        Compliance
      </OutletBreadcrumb>
      <Outlet />
    </PageBoundary>
  ),
});
