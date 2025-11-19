import {
  Biohazard,
  GitGraph,
  Lock,
  Rocket,
  ShieldAlert,
  Swords,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterMultiple } from '@/common/design-system/molecules/data-table/filters/command-filter-multiple';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { usePageTitle } from '@/common/lib/use-page-title';
import { OffendersWorldMap } from '@/features/hunt/entities/components/offenders-world-map/offenders-world-map';
import { clearQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { enableTags } from '@/features/hunt/filtering/query-filters/use-cases/enable-tags';
import { KillChainCounters } from '@/features/hunt/killchain/components/killchain-counters/killchain-counters';
import {
  KillChainKeysWithoutPolicies,
  killChainsConfig,
  killChainWithoutPoliciesOptions,
} from '@/features/hunt/killchain/killchain';
import { IndicatorsDocDopv } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';
import { IndicatorsAppliancePreview } from '@/features/hunt/operational-center/components/indicators/indicators.preview';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';
import { threatStatusColumns } from '@/features/hunt/threats/components/threat-status.columns';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';
import { useAppDispatch } from '@/store/store';

import { routes } from '../routes.config';
import { CipherSecurity } from './_components/cipher-security';
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
    navigate(routes.explorer);
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
            <Column>
              <BlockTitle className="mb-2">
                <Lock />
                Cipher Security
              </BlockTitle>
              <CipherSecurity />
            </Column>
            <Column className="w-full">
              <BlockTitle className="mb-2">
                <ShieldAlert />
                MITRE Techniques
              </BlockTitle>
              <MitreTechniques />
            </Column>
          </Column>
        </Grid>
      </DefaultPage>
    </>
  );
};

const columns = threatStatusColumns.filter(
  (col) => !['family', 'target_type'].includes(col.id!),
);
columns[0].enableSorting = false;

const IndicidentsTable = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [killChain, setKillChain] = useState<string[]>([]);
  const [pagination, setPagination] = usePaginationState();
  const { data, isFetching } = useGetThreatsStatusQuery({
    ...pagination,
    tenant: params.tenant,
    ordering: '-first_seen',
    first_seen__gte: params.start_date,
    first_seen__lte: params.end_date,
    kill_chain:
      killChain.length === 0
        ? KillChainKeysWithoutPolicies.join(',')
        : killChain?.join(','),
  });
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
      toolBar={
        <DataTableToolbar>
          <CommandFilterMultiple
            title="Kill chain"
            value={killChain}
            onChange={setKillChain}
            options={killChainWithoutPoliciesOptions}
          />
        </DataTableToolbar>
      }
      Empty={
        <Empty>
          <EmptyMedia variant="icon">
            <Biohazard />
          </EmptyMedia>
          <EmptyContent>
            <EmptyHeader>No incidents during this period</EmptyHeader>
            {killChain.length === 0 ||
            killChain.length === KillChainKeysWithoutPolicies.length ? (
              <>
                <EmptyDescription className="max-w-full">
                  Awesome, there are no incidents during this period ! You
                  finally have time to go through the Policy Violations or do
                  some hunting.
                </EmptyDescription>
                <Row className="gap-2">
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link to={routes.policy_violations}>Policy Violations</Link>
                  </Button>
                  <Button asChild>
                    <Link to={routes.explorer}>Go hunting</Link>
                  </Button>
                </Row>
              </>
            ) : (
              <EmptyDescription>
                You might be missing incidents for kill chains:{' '}
                {KillChainKeysWithoutPolicies.filter(
                  (kc) => !killChain.includes(kc),
                )
                  .map((kc) => killChainsConfig[kc].name)
                  .join(', ')}
              </EmptyDescription>
            )}
          </EmptyContent>
        </Empty>
      }
      serverSide
    />
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
