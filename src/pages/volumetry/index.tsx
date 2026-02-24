import { Search } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Input } from '@/common/design-system/atoms/ui/input';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import {
  ComposablePagination,
  ItemsCount,
  PageOptions,
  PageSelector,
} from '@/common/design-system/molecules/pagination';
import { StatsCardHorizontal } from '@/common/design-system/molecules/stats-card-horizontal';
import { usePageTitle } from '@/common/lib/use-page-title';
import { useGlobalStats } from '@/features/hunt/dashboard/api/hooks/useGlobalStats';
import { useEventsCount } from '@/features/hunt/events/api/hooks/useEventsCount';
import { usePreviousDates } from '@/features/hunt/filtering/dates-filters/use-previous-dates';
import { useGetProbesQuery } from '@/features/user/settings/settings.api';

import { indicators } from '../operational-center/config';
import { EventsTimeline } from './_components/events-timeline';

const pageSize = 5;

export const VolumetryPage = () => {
  usePageTitle('Volumetry');
  const previousDates = usePreviousDates();

  const { data: globalStats, isFetching: isGlobalLoading } = useGlobalStats();
  const { data: previousGlobalStats, isFetching: isPreviousGlobalLoading } =
    useGlobalStats(previousDates);

  const { data: eventsCount, isFetching: isEventsLoading } = useEventsCount();
  const { data: previousEventsCount, isFetching: isPreviousEventsLoading } =
    useEventsCount(previousDates);

  const loading = isGlobalLoading || isPreviousGlobalLoading;
  const eventsLoading = isEventsLoading || isPreviousEventsLoading;

  return (
    <>
      <OutletBreadcrumb>Volumetry</OutletBreadcrumb>
      <DefaultPage
        title="Volumetry"
        description="Overview of network data volume, transactions, and detection events over the selected time period."
      >
        <Grid className="mb-6 grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCardHorizontal
            {...indicators['analyzed-traffic']}
            value={globalStats?.volumetry}
            previousValue={previousGlobalStats?.volumetry}
            loading={loading}
          />
          <StatsCardHorizontal
            {...indicators['network-transactions']}
            value={globalStats?.nb_events}
            previousValue={previousGlobalStats?.nb_events}
            loading={loading}
          />
          <StatsCardHorizontal
            {...indicators.events}
            value={eventsCount?.doc_count}
            previousValue={previousEventsCount?.doc_count}
            loading={eventsLoading}
          />
        </Grid>
        <div className="mb-6">
          <EventsTimeline className="h-[250px]" />
        </div>
        <ProbeTimelineList />
      </DefaultPage>
    </>
  );
};

const ProbeTimelineList = () => {
  const [search, setSearch] = useQueryState(
    'probe_search',
    parseAsString.withDefault(''),
  );
  const [page, setPage] = useQueryState(
    'probe_page',
    parseAsInteger.withDefault(1),
  );

  const {
    data: probes,
    isFetching: isProbesLoading,
    isError: isProbesError,
  } = useGetProbesQuery();

  const filteredProbes = useMemo(() => {
    if (!probes) return [];
    if (!search) return probes;
    const lower = search.toLowerCase();
    return probes.filter((p) => p.name.toLowerCase().includes(lower));
  }, [probes, search]);

  const totalCount = filteredProbes.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageIndex = Math.min(page - 1, pageCount - 1);
  const paginatedProbes = filteredProbes.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );

  const handlePageIndexChange = (newIndex: number) => {
    setPage(newIndex + 1);
  };
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(localSearch || null);
      setPage(1);
    }, 550);
    return () => clearTimeout(timeout);
  }, [localSearch, setSearch, setPage]);

  return (
    <Column className="gap-4">
      <Row className="items-center gap-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Filter probes by name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-8 w-[250px] pl-8"
          />
        </div>
      </Row>

      {isProbesLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Spin />
        </div>
      ) : isProbesError ? (
        <div className="text-destructive flex h-[200px] items-center justify-center text-sm">
          Failed to load probes
        </div>
      ) : totalCount === 0 ? (
        <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
          {search ? 'No probes match your search' : 'No probes found'}
        </div>
      ) : (
        <>
          {paginatedProbes.map((probe) => (
            <Column key={probe.appliance_id}>
              <Row className="mb-2 items-center gap-3">
                <BlockTitle>{probe.name}</BlockTitle>
                <span className="text-muted-foreground text-xs">
                  {probe.address}
                </span>
              </Row>
              <EventsTimeline qfilterPrefix={`host:${probe.name}`} />
            </Column>
          ))}
          <ComposablePagination
            areSomeRowsSelected={false}
            selectedRowsCount={0}
            rowsCount={paginatedProbes.length}
            totalCount={totalCount}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onPageSizeChange={() => {}}
            onPageIndexChange={handlePageIndexChange}
            isPreviousPage={pageIndex > 0}
            isNextPage={pageIndex < pageCount - 1}
            pageCount={pageCount}
          >
            <ItemsCount />
            <PageOptions>
              <PageSelector />
            </PageOptions>
          </ComposablePagination>
        </>
      )}
    </Column>
  );
};
