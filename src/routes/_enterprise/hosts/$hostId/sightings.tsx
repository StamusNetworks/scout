import { createFileRoute, useParams } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { HostSightingsTable } from '@/features/host-insights/components/host-sightings-table/host-sightings-table';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default(''),
});

export const Route = createFileRoute('/_enterprise/hosts/$hostId/sightings')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="host-sightings">
      <HostSightingsTab />
    </PageBoundary>
  ),
});

function HostSightingsTab() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const search = Route.useSearch();
  const tanstackNavigate = Route.useNavigate();
  const navigate = (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => tanstackNavigate(opts as Parameters<typeof tanstackNavigate>[0]);

  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(
      { search, navigate },
      {
        resetOn: [globals.tenant, globals.start_date, globals.end_date],
      },
    );

  return (
    <HostSightingsTable
      hostId={hostId}
      page={page}
      pageSize={pageSize}
      sorting={sorting}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortingChange={onSortingChange}
    />
  );
}
