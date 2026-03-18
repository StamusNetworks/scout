import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { ServingIpsTable } from '@/features/events/beaconing/beaconing-ips/use-cases/ips-list/entities/serving-ips-table';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-beacon_report.beacon_metric'),
});

export const Route = createFileRoute('/_enterprise/analytics/beaconing/ips/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="beaconing-ips">
      <BeaconingIpsPage />
    </PageBoundary>
  ),
});

function BeaconingIpsPage() {
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
    <ServingIpsTable
      page={page}
      pageSize={pageSize}
      sorting={sorting}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortingChange={onSortingChange}
      onRowClick={(ip) =>
        tanstackNavigate({
          to: '/analytics/beaconing/ips/$ip',
          params: { ip },
        })
      }
    />
  );
}
