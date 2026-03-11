import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { FiltersActionsList } from '@/pages/filter-actions';

const filtersActionsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  page_size: z.number().min(1).catch(10),
  sort: z.string().optional(),
});

export type FiltersActionsSearch = z.output<typeof filtersActionsSearchSchema>;

export const Route = createFileRoute('/filters-actions')({
  validateSearch: (raw): FiltersActionsSearch =>
    filtersActionsSearchSchema.parse(raw),
  component: () => (
    <PageBoundary key="filters-actions">
      <FiltersActionsList />
    </PageBoundary>
  ),
});
