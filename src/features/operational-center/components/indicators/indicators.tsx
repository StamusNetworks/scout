import { useNavigate } from '@tanstack/react-router';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Card } from '@/common/design-system/atoms/ui/card';
import { StatsCardHorizontalContent } from '@/common/design-system/molecules/stats-card-horizontal';
import { usePreviousDates } from '@/features/dates';
import { useEventsCount } from '@/features/events/common/hooks/useEventsCount';
import { GlobalStats } from '@/features/events/detection-events/use-cases/explorer/api/dashboard.api';
import { useGlobalStats } from '@/features/events/detection-events/use-cases/explorer/api/hooks/useGlobalStats';
import { indicators } from '@/features/operational-center/config';
import { useSystemSettings } from '@/features/settings';

export const Indicators = () => {
  const previousDates = usePreviousDates();

  const { data: globalStats, isFetching: isGlobalLoading } = useGlobalStats();
  const { data: previousGlobalStats, isFetching: isPreviousGlobalLoading } =
    useGlobalStats(previousDates);

  const { data: eventsCount, isFetching: isEventsLoading } = useEventsCount();
  const { data: previousEventsCount, isFetching: isPreviousEventsLoading } =
    useEventsCount(previousDates);

  const { data: systemSettings } = useSystemSettings();
  const kibana_url = systemSettings?.kibanaUrl;
  return (
    <IndicatorsTemplate
      globalStats={globalStats}
      previousGlobalStats={previousGlobalStats}
      eventsCount={eventsCount}
      previousEventsCount={previousEventsCount}
      isGlobalLoading={isGlobalLoading}
      isPreviousGlobalLoading={isPreviousGlobalLoading}
      isEventsLoading={isEventsLoading}
      isPreviousEventsLoading={isPreviousEventsLoading}
      kibana_url={kibana_url}
    />
  );
};

interface IndicatorsTemplateProps {
  globalStats: GlobalStats | undefined;
  previousGlobalStats: GlobalStats | undefined;
  eventsCount: { prev_doc_count: number; doc_count: number } | undefined;
  previousEventsCount:
    | { prev_doc_count: number; doc_count: number }
    | undefined;
  isGlobalLoading: boolean;
  isPreviousGlobalLoading: boolean;
  isEventsLoading: boolean;
  isPreviousEventsLoading: boolean;
  kibana_url: string | undefined;
}
export const IndicatorsTemplate = ({
  globalStats,
  previousGlobalStats,
  isGlobalLoading,
  isPreviousGlobalLoading,
}: IndicatorsTemplateProps) => {
  const navigate = useNavigate();
  return (
    <>
      {/* <Grid className="mb-2 grid-cols-2 gap-2 xl:grid-cols-4">
        <StatsCardHorizontal
          {...indicators['analyzed-traffic']}
          value={globalStats?.volumetry || 0}
          previousValue={previousGlobalStats?.volumetry}
          loading={isGlobalLoading || isPreviousGlobalLoading}
          onClick={() => window.open(kibana_url)}
        />
        <StatsCardHorizontal
          {...indicators['network-transactions']}
          value={globalStats?.nb_events || 0}
          previousValue={previousGlobalStats?.nb_events}
          loading={isGlobalLoading || isPreviousGlobalLoading}
          onClick={() => window.open(kibana_url)}
        />
        <StatsCardHorizontal
          {...indicators['events']}
          value={eventsCount?.doc_count || 0}
          previousValue={previousEventsCount?.doc_count}
          loading={isEventsLoading || isPreviousEventsLoading}
          onClick={() => navigate(routes.events)}
        />
        <StatsCardHorizontal
          {...indicators['declarations']}
          value={globalStats?.nb_discovered}
          previousValue={previousGlobalStats?.nb_discovered}
          loading={isGlobalLoading || isPreviousGlobalLoading}
        />
      </Grid> */}
      <Grid className="mb-2 grid-cols-1 gap-2 xl:grid-cols-2">
        <Card
          className="h-full p-4"
          data-testid="doc-indicators"
        >
          <Row className="h-full grid-cols-3 gap-4">
            <StatsCardHorizontalContent
              {...indicators['doc-declarations']}
              value={globalStats?.nb_discovered_threats}
              previousValue={previousGlobalStats?.nb_discovered_threats}
              onClick={() => navigate({ to: '/threats' })}
              loading={isGlobalLoading || isPreviousGlobalLoading}
            />
            <div className="bg-border h-full w-px" />
            <StatsCardHorizontalContent
              {...indicators['doc-assets']}
              value={globalStats?.nb_assets_threat}
              previousValue={previousGlobalStats?.nb_assets_threat}
              onClick={() => navigate({ to: '/threats' })}
              loading={isGlobalLoading || isPreviousGlobalLoading}
            />
            <div className="bg-border h-full w-px" />
            <StatsCardHorizontalContent
              {...indicators['doc-threats']}
              value={globalStats?.nb_threats || 0}
              previousValue={previousGlobalStats?.nb_threats}
              onClick={() =>
                navigate({
                  to: '/threats/coverage',
                  search: { show: 'threats' },
                })
              }
              loading={isGlobalLoading || isPreviousGlobalLoading}
            />
          </Row>
        </Card>
        <Card
          className="h-full p-4"
          data-testid="dopv-indicators"
        >
          <Row className="h-full grid-cols-3 gap-4">
            <StatsCardHorizontalContent
              {...indicators['dopv-declarations']}
              value={globalStats?.nb_discovered_policies || 0}
              previousValue={previousGlobalStats?.nb_discovered_policies}
              loading={isGlobalLoading || isPreviousGlobalLoading}
              onClick={() => navigate({ to: '/policy-violations' })}
            />
            <div className="bg-border h-full w-px" />
            <StatsCardHorizontalContent
              {...indicators['dopv-assets']}
              value={globalStats?.nb_assets_policy || 0}
              previousValue={previousGlobalStats?.nb_assets_policy}
              onClick={() => navigate({ to: '/policy-violations' })}
              loading={isGlobalLoading || isPreviousGlobalLoading}
            />
            <div className="bg-border h-full w-px" />
            <StatsCardHorizontalContent
              {...indicators['dopv-threats']}
              value={globalStats?.nb_policies || 0}
              previousValue={previousGlobalStats?.nb_policies}
              onClick={() =>
                navigate({
                  to: '/policy-violations/coverage',
                  search: { show: 'threats' },
                })
              }
              loading={isGlobalLoading || isPreviousGlobalLoading}
            />
          </Row>
        </Card>
      </Grid>
    </>
  );
};
