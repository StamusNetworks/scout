import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/_enterprise/threats')({
  component: () => (
    <>
      <OutletBreadcrumb link="/threats/compromises">Threats</OutletBreadcrumb>
      <Outlet />
    </>
  ),
});
