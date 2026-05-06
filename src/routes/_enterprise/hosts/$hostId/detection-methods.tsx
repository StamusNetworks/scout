import { createFileRoute, useParams } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { HostDetectionMethodsTable } from '@/features/host-insights';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-hits'),
});

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/detection-methods',
)({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="host-detection-methods">
      <HostDetectionMethodsTab />
    </PageBoundary>
  ),
});

function HostDetectionMethodsTab() {
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
        resetOn: [globals.tenant, globals.from, globals.to],
      },
    );

  return (
    <HostDetectionMethodsTable
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
