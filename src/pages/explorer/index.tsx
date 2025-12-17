import { Binary } from 'lucide-react';
import { keys, values } from 'ramda';
import { Link } from 'react-router-dom';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { getConfig } from '@/config';
import { useDashboard } from '@/features/hunt/dashboard/api/hooks/useDashboard';
import { DashboardPanels } from '@/features/hunt/dashboard/components/dashboard-panels';
import { EventsCounter } from '@/features/hunt/dashboard/components/events-counter';
import { EventsCountTimeline } from '@/features/hunt/dashboard/components/events-counts-timeline';
import { ExpandCollapseRows } from '@/features/hunt/dashboard/components/expand-collapse-rows';
import { HideEmptyPanels } from '@/features/hunt/dashboard/components/hide-empty-tiles';
import { OrderingSelector } from '@/features/hunt/dashboard/components/ordering-selector';
import { PageSizeSelector } from '@/features/hunt/dashboard/components/page-size-selector';
import { useGetSystemSettingsQuery } from '@/features/user/settings/settings.api';

export const Explorer = () => {
  usePageTitle('Explorer');
  const { data: dashboardData, isLoading } = useDashboard();
  const { data: systemSettings } = useGetSystemSettingsQuery();
  const kibana_url = systemSettings?.kibana_url;

  return (
    <>
      <OutletBreadcrumb>Explorer</OutletBreadcrumb>
      <DefaultPage
        className="space-y-4"
        title="Explorer"
        description="Quickly understand and investigate event data through interactive panels and timelines, enabling deep exploration and agile threat hunting to support confident, informed security decisions."
      >
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
            values(dashboardData).some((data) => data.length > 0) ? ( // Field stats returns an empty object if ES is emptied
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
      </DefaultPage>
    </>
  );
};
