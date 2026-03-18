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
import { useDashboard } from '@/features/hunt/dashboard/api/hooks/useDashboard';
import { DashboardPanels } from '@/features/hunt/dashboard/components/dashboard-panels';
import { EventsCounter } from '@/features/hunt/dashboard/components/events-counter';
import { EventsCountTimeline } from '@/features/hunt/dashboard/components/events-counts-timeline';
import { ExpandCollapseRows } from '@/features/hunt/dashboard/components/expand-collapse-rows';
import { HideEmptyPanels } from '@/features/hunt/dashboard/components/hide-empty-tiles';
import { OrderingSelector } from '@/features/hunt/dashboard/components/ordering-selector';
import { PageSizeSelector } from '@/features/hunt/dashboard/components/page-size-selector';

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
