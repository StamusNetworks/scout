import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/_enterprise/policy-violations')({
  component: () => (
    <>
      <OutletBreadcrumb link="/policy-violations/violations">
        Compliance
      </OutletBreadcrumb>
      <Outlet />
    </>
  ),
});
