import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import {
  SummaryMatrix,
  useNetworkHuntingTrailContext,
} from '@/features/hunting-trail';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(20),
  sort: z.string().default(''),
});

export const Route = createFileRoute('/_enterprise/hunting-trail/summary')({
  validateSearch: searchSchema,
  component: SummaryPage,
});

function SummaryPage() {
  const { groups, queryMetadata } = useNetworkHuntingTrailContext();
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
        defaultPageSize: 20,
      },
    );

  return (
    <SummaryMatrix
      groups={groups}
      page={page}
      pageSize={pageSize}
      sorting={sorting}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortingChange={onSortingChange}
      queryMetadata={queryMetadata}
    />
  );
}
