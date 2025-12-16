import { useState } from 'react';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { usePageTitle } from '@/common/lib/use-page-title';
import { EventsCounter } from '@/features/hunt/dashboard/components/events-counter';
import { EventsTable } from '@/features/hunt/events/components/events-table/events-table';
import { setDates } from '@/features/hunt/filtering/dates-filters/dates-filters.slice';
import { useTimeline } from '@/features/hunt/timeline/api/hooks/useTimeline';
import { useAppDispatch } from '@/store/store';

export const Events = () => {
  usePageTitle('Events');
  return (
    <DefaultPage
      title="Events"
      description="Monitor, explore, and analyze your organization’s security events in real time. Gain actionable insight and accelerate investigations by exploring the detailed events data."
    >
      <Grid className="grid-cols-[1fr_300px] items-center gap-4">
        <EventsCountTimeline />
        <EventsCounter />
      </Grid>
      <EventsTable />
    </DefaultPage>
  );
};

export const EventsCountTimeline = () => {
  const { enterprise } = useFeatureFlags();
  const [chartTarget, setChartTarget] = useState<boolean>(true); // Chart target can only be specified in Enterprise
  const compChartTarget = enterprise ? chartTarget : false;

  const { data } = useTimeline(compChartTarget);

  const dispatch = useAppDispatch();
  const handleBarClick = (obj: { time: number }) => {
    dispatch(
      setDates({
        type: 'range',
        start_date: obj.time,
        end_date: obj.time + (data?.interval || 0),
      }),
    );
  };

  return (
    <Column>
      {enterprise && (
        <Row className="mb-2 justify-end">
          <Tabs value={compChartTarget.toString()}>
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
      )}
      {!data ? null : (
        <BarChartTimeline
          data={data}
          className="h-[250px]"
          onBarClick={handleBarClick}
        />
      )}
    </Column>
  );
};
