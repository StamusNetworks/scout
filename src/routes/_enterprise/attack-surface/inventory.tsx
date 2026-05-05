import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { useSearchNavigate } from '@/common/lib/use-search-navigate';
import { HostsInventoryTable } from '@/features/host-insights/components/hosts-inventory-table/hosts-inventory-table';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().optional(),
});

export const Route = createFileRoute('/_enterprise/attack-surface/inventory')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="attack-surface-inventory">
      <AttackSurfaceInventoryPage />
    </PageBoundary>
  ),
});

function AttackSurfaceInventoryPage() {
  const search = Route.useSearch();
  const parentSearch = useSearch({ from: '/_enterprise/attack-surface' });
  const navigate = useSearchNavigate();
  const tanstackNavigate = useNavigate();

  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(
      { search, navigate },
      {
        resetOn: [globals.tenant, globals.start_date, globals.end_date],
      },
    );

  return (
    <HostsInventoryTable
      page={page}
      pageSize={pageSize}
      sorting={sorting}
      inHomeNetwork={parentSearch.in_home_net}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortingChange={onSortingChange}
      onRowClick={(hostId) =>
        tanstackNavigate({
          to: '/hosts/$hostId',
          params: { hostId },
        })
      }
    />
  );
}
