import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/_enterprise/analytics/sightings')({
  component: () => (
    <>
      <OutletBreadcrumb>Sightings</OutletBreadcrumb>
      <Outlet />
    </>
  ),
});
