import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { DetectionEventsTable } from '@/features/events/detection-events/entities/detection-events-table';
import { EventsCounter } from '@/features/events/detection-events/entities/events-counter';
import { EventsTimeline } from '@/features/events/detection-events/entities/events-timeline';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

export const Route = createFileRoute('/detection-events/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="events">
      <DetectionEventsPage />
    </PageBoundary>
  ),
});

function DetectionEventsPage() {
  usePageTitle('Events');
  const search = Route.useSearch();
  const tanstackNavigate = Route.useNavigate();
  const navigate = (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => tanstackNavigate(opts as Parameters<typeof tanstackNavigate>[0]);

  const globals = useGlobalQueryParams([
    'tenant',
    'dates',
    'qfilter',
    'qfilterHost',
  ]);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(
      { search, navigate },
      {
        resetOn: [
          globals.tenant,
          globals.start_date,
          globals.end_date,
          globals.qfilter,
          globals.host_id_qfilter,
        ],
      },
    );

  return (
    <Page>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Events</PageTitle>
            <PageDescription>
              Monitor, explore, and analyze your organization&apos;s security
              events in real time. Gain actionable insight and accelerate
              investigations by exploring the detailed events data.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <Grid className="grid-cols-[1fr_300px] items-center gap-4">
          <EventsTimeline />
          <EventsCounter />
        </Grid>
        <DetectionEventsTable
          page={page}
          pageSize={pageSize}
          sorting={sorting}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSortingChange={onSortingChange}
        />
      </TogglePageContainer>
    </Page>
  );
}
