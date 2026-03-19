import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { FilterSetsView } from '@/features/filtering/filtersets/use-cases/list-filter-sets/filter-sets-view';

export const Route = createFileRoute('/filter-sets')({
  component: () => (
    <PageBoundary key="filter-sets">
      <FilterSetsPage />
    </PageBoundary>
  ),
});

function FilterSetsPage() {
  usePageTitle('Filter Sets');
  return (
    <>
      <OutletBreadcrumb>Filter Sets</OutletBreadcrumb>
      <FilterSetsView />
    </>
  );
}
