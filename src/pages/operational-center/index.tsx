import { GitGraph, Lock, Rocket, ShieldAlert, Swords } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/design-system/atoms/ui/alert';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { usePageTitle } from '@/common/lib/use-page-title';
import { OffendersWorldMap } from '@/features/hunt/entities/components/offenders-world-map/offenders-world-map';
import { clearQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { enableTags } from '@/features/hunt/filtering/query-filters/use-cases/enable-tags';
import { KillChainCounters } from '@/features/hunt/killchain/components/killchain-counters/killchain-counters';
import { IndicatorsDocDopv } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';
import { IndicatorsAppliancePreview } from '@/features/hunt/operational-center/components/indicators/indicators.preview';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';
import { useAppDispatch } from '@/store/store';

import { CipherSecurity } from './_components/cipher-security';
import { IndicidentsTable } from './_components/incidents-table';
import { MitreTechniques } from './_components/mitre-techniques';
import { OutliersTimeline } from './_components/outliers-timeline';

export const OperationalCenter = () => {
  usePageTitle('Operational Center');
  const { enterprise } = useFeatureFlags();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleClickOutliers = () => {
    enableTags(dispatch, { novelty: true });
    dispatch(clearQueryFilters());
    navigate({ to: '/explorer' });
  };

  return (
    <>
      <OutletBreadcrumb>Operational Center</OutletBreadcrumb>
      <DefaultPage
        title="Operational Center"
        description="Get a unified, actionable view of your organization's security posture in real time. Use this dashboard as your main entry point for monitoring, investigation, and operational decision-making."
        alert={
          !enterprise ? (
            <Alert
              className="mb-3 w-full"
              variant="primary"
            >
              <Rocket />
              <AlertTitle>Enterprise feature</AlertTitle>
              <AlertDescription>
                This page is using fake data in order to showcase the Enterprise
                feature
              </AlertDescription>
            </Alert>
          ) : null
        }
      >
        {enterprise ? <IndicatorsDocDopv /> : <IndicatorsAppliancePreview />}
        <div className="mb-4">
          <KillChainCounters />
        </div>
        <Grid className="grid-cols-2 gap-8">
          <Column className="gap-4">
            <Column>
              <BlockTitle className="mb-2">
                <ShieldAlert />
                New Incidents
              </BlockTitle>
              <IndicidentsTable />
            </Column>
            <Column>
              <BlockTitle className="mb-2">
                <Swords /> Offenders
              </BlockTitle>
              <OffendersWorldMap />
            </Column>
          </Column>
          <Column className="gap-4">
            <Column>
              <BlockTitle
                className="mb-2 cursor-pointer"
                onClick={handleClickOutliers}
              >
                <GitGraph />
                Outlier Events
              </BlockTitle>
              <OutliersTimeline />
            </Column>
            <Column className="w-full">
              <BlockTitle className="mb-2">
                <ShieldAlert />
                MITRE Techniques
              </BlockTitle>
              <MitreTechniques />
            </Column>
            <Column>
              <BlockTitle className="mb-2">
                <Lock />
                Cipher Security
              </BlockTitle>
              <CipherSecurity />
            </Column>
          </Column>
        </Grid>
      </DefaultPage>
    </>
  );
};

export const EventsCountTimeline = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [chartTarget, setChartTarget] = useState<boolean>(true);
  const { data } = useGetCountsTimelineQuery({
    ...params,
    target: chartTarget.toString(),
  });
  return (
    <Column>
      <Row className="mb-2 justify-end">
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
      {!data ? null : <BarChartTimeline data={data} />}
    </Column>
  );
};
