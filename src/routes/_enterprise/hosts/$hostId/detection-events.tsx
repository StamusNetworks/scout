import { createFileRoute, useParams } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { DetectionEventsTable } from '@/features/events/detection-events/entities/detection-events-table';
import { EventsTimeline } from '@/features/events/detection-events/entities/events-timeline';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/detection-events',
)({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="host-detection-events">
      <HostDetectionEventsTab />
    </PageBoundary>
  ),
});

function HostDetectionEventsTab() {
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
    <>
      <EventsTimeline hostId={hostId} />
      <DetectionEventsTable
        page={page}
        pageSize={pageSize}
        sorting={sorting}
        hostId={hostId}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortingChange={onSortingChange}
      />
    </>
  );
}
