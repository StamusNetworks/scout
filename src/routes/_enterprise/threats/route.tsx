import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/_enterprise/threats')({
  component: () => (
    <PageBoundary key="threats">
      <OutletBreadcrumb link="/threats/compromises">Threats</OutletBreadcrumb>
      <Outlet />
    </PageBoundary>
  ),
});
