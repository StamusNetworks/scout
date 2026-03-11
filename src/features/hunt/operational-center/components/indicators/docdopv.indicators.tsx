import { useNavigate } from '@tanstack/react-router';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Card } from '@/common/design-system/atoms/ui/card';
import { StatsCardHorizontalContent } from '@/common/design-system/molecules/stats-card-horizontal';
import { useGlobalStats } from '@/features/hunt/dashboard/api/hooks/useGlobalStats';
import { usePreviousDates } from '@/features/hunt/filtering/dates-filters/use-previous-dates';
import { indicators } from '@/pages/operational-center/config';

export const IndicatorsDocDopv = () => {
  const navigate = useNavigate();
  const previousDates = usePreviousDates();

  const { data: globalStats, isFetching: isGlobalLoading } = useGlobalStats();
  const { data: previousGlobalStats, isFetching: isPreviousGlobalLoading } =
    useGlobalStats(previousDates);
  return (
    <Grid className="mb-4 grid-cols-1 gap-4 xl:grid-cols-2">
      <Card
        className="h-full p-4"
        data-testid="doc-indicators"
        variant={
          [
            globalStats?.nb_discovered_threats,
            globalStats?.nb_assets_threat,
            globalStats?.nb_threats,
          ].some((v) => v !== 0)
            ? 'doc'
            : 'base'
        }
      >
        <Row className="h-full grid-cols-3 gap-4">
          <StatsCardHorizontalContent
            {...indicators['doc-declarations']}
            value={globalStats?.nb_discovered_threats}
            previousValue={previousGlobalStats?.nb_discovered_threats}
            loading={isGlobalLoading || isPreviousGlobalLoading}
            onClick={() => navigate({ to: '/threats' })}
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
            onClick={() => navigate({ to: '/threats/coverage?show=threat' })}
            loading={isGlobalLoading || isPreviousGlobalLoading}
          />
        </Row>
      </Card>
      <Card
        className="h-full p-4"
        data-testid="dopv-indicators"
        variant={
          [
            globalStats?.nb_discovered_policies,
            globalStats?.nb_assets_policy,
            globalStats?.nb_policies,
          ].some((v) => v !== 0)
            ? 'dopv'
            : 'base'
        }
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
              navigate({ to: '/policy-violations/coverage?show=threat' })
            }
            loading={isGlobalLoading || isPreviousGlobalLoading}
          />
        </Row>
      </Card>
    </Grid>
  );
};

export const IndicatorsDoc = () => {
  const navigate = useNavigate();
  const previousDates = usePreviousDates();

  const { data: globalStats, isFetching: isGlobalLoading } = useGlobalStats();
  const { data: previousGlobalStats, isFetching: isPreviousGlobalLoading } =
    useGlobalStats(previousDates);
  return (
    <Card
      className="h-full max-w-2xl grow p-4"
      data-testid="doc-indicators"
      variant={
        [
          globalStats?.nb_discovered_threats,
          globalStats?.nb_assets_threat,
          globalStats?.nb_threats,
        ].some((v) => v !== 0)
          ? 'doc'
          : 'base'
      }
    >
      <Row className="h-full gap-4">
        <StatsCardHorizontalContent
          {...indicators['doc-declarations']}
          value={globalStats?.nb_discovered_threats}
          previousValue={previousGlobalStats?.nb_discovered_threats}
          loading={isGlobalLoading || isPreviousGlobalLoading}
          onClick={() => navigate({ to: '/threats' })}
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
          onClick={() => navigate({ to: '/threats/coverage?show=threat' })}
          loading={isGlobalLoading || isPreviousGlobalLoading}
        />
      </Row>
    </Card>
  );
};

export const IndicatorsDopv = () => {
  const navigate = useNavigate();
  const previousDates = usePreviousDates();

  const { data: globalStats, isFetching: isGlobalLoading } = useGlobalStats();
  const { data: previousGlobalStats, isFetching: isPreviousGlobalLoading } =
    useGlobalStats(previousDates);
  return (
    <Card
      className="h-full max-w-2xl grow p-4"
      data-testid="dopv-indicators"
      variant={
        [
          globalStats?.nb_discovered_policies,
          globalStats?.nb_assets_policy,
          globalStats?.nb_policies,
        ].some((v) => v !== 0)
          ? 'dopv'
          : 'base'
      }
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
            navigate({ to: '/policy-violations/coverage?show=threat' })
          }
          loading={isGlobalLoading || isPreviousGlobalLoading}
        />
      </Row>
    </Card>
  );
};
