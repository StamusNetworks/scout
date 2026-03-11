import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { FiltersActionsList } from '@/pages/filter-actions';

export const Route = createFileRoute('/filters-actions')({
  component: () => (
    <PageBoundary key="filters-actions">
      <FiltersActionsList />
    </PageBoundary>
  ),
});
