import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/detection-events')({
  component: () => (
    <>
      <OutletBreadcrumb>Events</OutletBreadcrumb>
      <Outlet />
    </>
  ),
});
