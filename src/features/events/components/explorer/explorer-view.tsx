import { Binary } from 'lucide-react';
import { keys, values } from 'ramda';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { EventsCounter } from '@/features/events/components/events-counter/events-counter';
import { EventsCountTimeline } from '@/features/events/components/events-counts-timeline/events-counts-timeline';
import { DashboardPanels } from '@/features/events/components/explorer/dashboard-panels';
import { ExpandCollapseRows } from '@/features/events/components/explorer/expand-collapse-rows';
import { HideEmptyPanels } from '@/features/events/components/explorer/hide-empty-tiles';
import { OrderingSelector } from '@/features/events/components/explorer/ordering-selector';
import { PageSizeSelector } from '@/features/events/components/explorer/page-size-selector';
import { useDashboard } from '@/features/events/hooks/use-dashboard';

export const ExplorerView = () => {
  const { data: dashboardData, isLoading } = useDashboard();

  return (
    <>
      <Grid className="grid-cols-[1fr_300px] items-center gap-4">
        <EventsCountTimeline />
        <EventsCounter />
      </Grid>
      <Row className="mt-2 items-center gap-4">
        <PageSizeSelector />
        <OrderingSelector />
        <ExpandCollapseRows />
        <HideEmptyPanels />
      </Row>
      <Column className="mt-2 gap-4">
        {isLoading ? (
          <Spin />
        ) : dashboardData &&
          keys(dashboardData).length > 0 &&
          values(dashboardData).some((data) => data.length > 0) ? (
          <DashboardPanels />
        ) : (
          <Empty className="border md:py-32">
            <EmptyMedia variant="icon">
              <Binary />
            </EmptyMedia>
            <EmptyContent>
              <EmptyHeader>No events found</EmptyHeader>
              <EmptyDescription>
                Either there are no events or the filters are too restrictive.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        )}
      </Column>
    </>
  );
};
