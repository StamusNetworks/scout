import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { FilterSetsPage } from '@/pages/filter-sets';

export const Route = createFileRoute('/filter-sets')({
  component: () => (
    <PageBoundary key="filter-sets">
      <FilterSetsPage />
    </PageBoundary>
  ),
});
