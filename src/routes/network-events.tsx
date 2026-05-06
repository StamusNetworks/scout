import { useNavigate } from '@tanstack/react-router';
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
import { NetworkEventsList } from '@/features/events';
import { NetworkEventsTimeline } from '@/features/events';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(20),
  group_by_flow: z.boolean().default(true),
});

export const Route = createFileRoute('/network-events')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary>
      <NetworkEventsPage />
    </PageBoundary>
  ),
});

function NetworkEventsPage() {
  usePageTitle('Network Events');
  const search = Route.useSearch();
  const tanstackNavigate = useNavigate();
  const navigate = (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => tanstackNavigate(opts as Parameters<typeof tanstackNavigate>[0]);

  const globals = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);

  const { page, setPage } = usePaginatedSearch(
    { search, navigate },
    {
      resetOn: [globals.tenant, globals.from, globals.to, globals.qfilter],
    },
  );

  return (
    <Page>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Network Events</PageTitle>
            <PageDescription>
              Explore detailed network activity with transaction cards that help
              you investigate and correlate related NSM events, making it easier
              to follow key flows and gain meaningful context for effective
              incident analysis.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <NetworkEventsTimeline />
        <NetworkEventsList
          page={page}
          pageSize={search.page_size}
          groupByFlow={search.group_by_flow}
          onPageChange={setPage}
          onPageSizeChange={(s) =>
            navigate({ search: (prev) => ({ ...prev, page_size: s, page: 1 }) })
          }
          onGroupByFlowChange={(v) =>
            navigate({
              search: (prev) => ({ ...prev, group_by_flow: v, page: 1 }),
            })
          }
        />
      </TogglePageContainer>
    </Page>
  );
}
