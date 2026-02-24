import { useState } from 'react';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { StatsCardHorizontal } from '@/common/design-system/molecules/stats-card-horizontal';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { usePageTitle } from '@/common/lib/use-page-title';
import { useGlobalStats } from '@/features/hunt/dashboard/api/hooks/useGlobalStats';
import { useEventsCount } from '@/features/hunt/events/api/hooks/useEventsCount';
import { usePreviousDates } from '@/features/hunt/filtering/dates-filters/use-previous-dates';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';

import { indicators } from '../operational-center/config';

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
        <EventsTimeline />
      </DefaultPage>
    </>
  );
};

const EventsTimeline = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [chartTarget, setChartTarget] = useState<boolean>(true);
  const { data, isFetching } = useGetCountsTimelineQuery({
    ...params,
    target: chartTarget.toString(),
  });

  return (
    <Column>
      <Row className="mb-2 items-center justify-between">
        <BlockTitle>Events Timeline</BlockTitle>
        <Tabs value={chartTarget.toString()}>
          <TabsList>
            <TabsTrigger
              value="true"
              onClick={() => setChartTarget(true)}
            >
              Tags
            </TabsTrigger>
            <TabsTrigger
              value="false"
              onClick={() => setChartTarget(false)}
            >
              Probes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Row>
      {isFetching ? (
        <div className="flex h-[250px] items-center justify-center">
          <Spin />
        </div>
      ) : !data ? null : (
        <BarChartTimeline data={data} />
      )}
    </Column>
  );
};
