import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { HostsInventoryTable } from '@/features/host-insights/use-cases/hosts-list/entities/hosts-inventory-table';

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
  const tanstackNavigate = useNavigate();
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
    <HostsInventoryTable
      page={page}
      pageSize={pageSize}
      sorting={sorting}
      inHomeNet={parentSearch.in_home_net}
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
