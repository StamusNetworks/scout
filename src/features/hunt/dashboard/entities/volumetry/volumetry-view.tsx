import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Input } from '@/common/design-system/atoms/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  ComposablePagination,
  ItemsCount,
  PageOptions,
  PageSelector,
} from '@/common/design-system/molecules/pagination';
import { StatsCardHorizontal } from '@/common/design-system/molecules/stats-card-horizontal';
import { esEscape } from '@/common/lib/strings';
import { useGlobalStats } from '@/features/hunt/dashboard/api/hooks/useGlobalStats';
import { useEventsCount } from '@/features/hunt/events/api/hooks/useEventsCount';
import { usePreviousDates } from '@/features/hunt/filtering/dates-filters/use-previous-dates';
import { indicators } from '@/features/hunt/operational-center/config';
import { useGetProbesQuery } from '@/features/user/settings/settings.api';
import { Route } from '@/routes/_enterprise/volumetry';

import { type ChartScale } from './dual-axis-line-chart';
import { EventsTimeline } from './events-timeline';
import { SeriesToggleBar } from './series-toggle-bar';

const pageSize = 5;

export const VolumetryView = () => {
  const { scale } = Route.useSearch();
  const navigate = useNavigate();
  const previousDates = usePreviousDates();

  const { data: globalStats, isFetching: isGlobalLoading } = useGlobalStats();
  const { data: previousGlobalStats, isFetching: isPreviousGlobalLoading } =
    useGlobalStats(previousDates);

  const { data: eventsCount, isFetching: isEventsLoading } = useEventsCount();
  const { data: previousEventsCount, isFetching: isPreviousEventsLoading } =
    useEventsCount(previousDates);

  const loading = isGlobalLoading || isPreviousGlobalLoading;
  const eventsLoading = isEventsLoading || isPreviousEventsLoading;

  const handleScaleChange = (value: string) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, scale: value as ChartScale }),
      replace: true,
    });
  };

  return (
    <>
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
      <Row className="mb-4 items-center justify-between">
        <SeriesToggleBar />
        <Tabs
          value={scale}
          onValueChange={handleScaleChange}
        >
          <TabsList>
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="normalized">Normalized</TabsTrigger>
            <TabsTrigger value="log">Logarithmic</TabsTrigger>
          </TabsList>
        </Tabs>
      </Row>
      <div className="mb-6">
        <EventsTimeline
          scale={scale}
          className="h-[250px]"
        />
      </div>
      <ProbeTimelineList scale={scale} />
    </>
  );
};

const ProbeTimelineList = ({ scale }: { scale: ChartScale }) => {
  const { probe_search: search = '', probe_page: page = 1 } = Route.useSearch();
  const navigate = useNavigate();

  const setSearch = (value: string | undefined) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        probe_search: value || undefined,
        probe_page: 1,
      }),
      replace: true,
    });
  };

  const setPage = (value: number) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, probe_page: value }),
      replace: true,
    });
  };

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
      setSearch(localSearch || undefined);
    }, 550);
    return () => clearTimeout(timeout);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

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
              <EventsTimeline
                qfilterPrefix={`host:"${esEscape(probe.name)}"`}
                scale={scale}
              />
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
