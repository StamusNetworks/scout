import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { JA3SHashTable } from '@/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-list/entities/ja3s-hash-table';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-beacon_report.beacon_metric'),
});

export const Route = createFileRoute('/_enterprise/analytics/beaconing/ja3s/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="beaconing-ja3s">
      <BeaconingJa3sPage />
    </PageBoundary>
  ),
});

function BeaconingJa3sPage() {
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
    <JA3SHashTable
      page={page}
      pageSize={pageSize}
      sorting={sorting}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortingChange={onSortingChange}
      onRowClick={(ja3s) =>
        tanstackNavigate({
          to: '/analytics/beaconing/ja3s/$ja3s',
          params: { ja3s },
        })
      }
    />
  );
}
