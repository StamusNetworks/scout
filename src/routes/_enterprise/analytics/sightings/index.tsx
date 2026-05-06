import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { usePageTitle } from '@/common/lib/use-page-title';
import { TogglePageContainer } from '@/features/app-shell';
import { SightingsTable } from '@/features/events';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

export const Route = createFileRoute('/_enterprise/analytics/sightings/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="sightings">
      <SightingsPage />
    </PageBoundary>
  ),
});

function SightingsPage() {
  usePageTitle('Sightings');
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
    <Page>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Sightings</PageTitle>
            <PageDescription>
              Sightings events identify never observed before metadata, such as
              a HTTP User-Agent, a domain name, a JA4 hash, and more.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <SightingsTable
          page={page}
          pageSize={pageSize}
          sorting={sorting}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSortingChange={onSortingChange}
          onRowClick={(id) =>
            tanstackNavigate({
              to: '/analytics/sightings/$sightingId',
              params: { sightingId: id },
            })
          }
        />
      </TogglePageContainer>
    </Page>
  );
}
