import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { InvestigationsView } from '@/features/investigation/entities/investigations-view';

export const Route = createFileRoute('/investigations')({
  component: () => (
    <PageBoundary key="investigations">
      <InvestigationsPage />
    </PageBoundary>
  ),
});

function InvestigationsPage() {
  usePageTitle('Investigations');
  return (
    <>
      <OutletBreadcrumb>Investigations</OutletBreadcrumb>
      <InvestigationsView />
    </>
  );
}
