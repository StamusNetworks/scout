import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Markdown } from '@/common/design-system/atoms/markdown';
import {
  Page,
  PageActions,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageStat,
  PageStats,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import {
  ThreatActions,
  ThreatDetailTabs,
  ThreatName,
  useThreatById,
} from '@/features/threats';
import { useThreatDetectionMethods } from '@/features/threats/common/hooks/use-threat-detection-methods';
import { useThreatEvents } from '@/features/threats/common/hooks/use-threat-events';
import {
  useGetActiveThreatsQuery,
  useGetThreatFamiliesQuery,
} from '@/features/threats/common/threats.api';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId',
)({
  component: () => (
    <PageBoundary key="pv-by-id">
      <OutletBreadcrumb link="/policy-violations/coverage">
        Coverage
      </OutletBreadcrumb>
      <PolicyViolationDetailPage />
    </PageBoundary>
  ),
});

function PolicyViolationDetailPage() {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const { tenant, start_date, end_date } = useGlobalQueryParams([
    'tenant',
    'dates',
  ]);
  const [, , ordering] = useSortingUrlState();
  const [pagination] = usePaginationUrlState();

  const { data: threat } = useThreatById({ threatId, tenant });
  const { data: activeThreat, isLoading: activeThreatLoading } =
    useGetActiveThreatsQuery(
      { tenant, start_date, end_date },
      {
        selectFromResult: (result) => ({
          ...result,
          data: result.data?.entities[parseInt(threatId)],
        }),
      },
    );
  const { data: family } = useGetThreatFamiliesQuery(
    {},
    {
      selectFromResult: (result) => ({
        ...result,
        data: threat && result.data?.entities[threat.familyId],
      }),
      skip: !threat,
    },
  );
  const { data: events, isLoading: eventsLoading } = useThreatEvents({
    threatId,
    pagination,
    ordering,
  });
  const { data: detectionMethods, isLoading: detectionMethodsLoading } =
    useThreatDetectionMethods({ threatId, pagination, ordering });

  if (!threat) return null;

  const assets = activeThreat?.nb_assets;
  const entitiesCount =
    (assets?.nb_victim ?? 0) +
    (assets?.nb_offender ?? 0) -
    (assets?.nb_both ?? 0);

  return (
    <>
      {family && (
        <OutletBreadcrumb
          link={`/policy-violations/coverage/family/${family.pk}`}
        >
          {family.name}
        </OutletBreadcrumb>
      )}
      <OutletBreadcrumb>{threat.name}</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <ThreatName threat={threat} />
              <PageDescription>
                <Markdown
                  content={
                    threat.description + ' ' + (threat.additionalInfo ?? '')
                  }
                />
              </PageDescription>
            </PageHeaderContent>
            <PageActions>
              <ThreatActions threatName={threat.name} />
            </PageActions>
          </PageHeader>
          <PageStats>
            <PageStat
              label="New victims"
              value={assets?.nb_new_victim ?? 0}
            />
            <PageStat
              label="Total victims"
              value={assets?.nb_victim ?? 0}
            />
            <PageStat
              label="New offenders"
              value={assets?.nb_new_offender ?? 0}
            />
            <PageStat
              label="Total offenders"
              value={assets?.nb_offender ?? 0}
            />
          </PageStats>
          <ThreatDetailTabs
            threat={threat}
            entities={{
              count: entitiesCount,
              isLoading: activeThreatLoading,
            }}
            detectionMethods={{
              count: detectionMethods?.count ?? 0,
              isLoading: detectionMethodsLoading,
            }}
            events={{
              count: events?.count ?? 0,
              isLoading: eventsLoading,
            }}
          />
          <Outlet />
        </TogglePageContainer>
      </Page>
    </>
  );
}
