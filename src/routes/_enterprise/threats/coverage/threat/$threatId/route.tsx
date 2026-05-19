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
import { TogglePageContainer } from '@/features/app-shell';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import {
  ThreatActions,
  ThreatDetailTabs,
  ThreatName,
  useThreatById,
} from '@/features/threats';
import {
  useGetActiveThreatsQuery,
  useGetThreatFamiliesQuery,
} from '@/features/threats';
import { useThreatDetectionMethods } from '@/features/threats';
import { useThreatEvents } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/threat/$threatId',
)({
  component: () => (
    <PageBoundary key="threat-by-id">
      <OutletBreadcrumb link="/threats/coverage">Coverage</OutletBreadcrumb>
      <ThreatDetailPage />
    </PageBoundary>
  ),
});

function ThreatDetailPage() {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const { tenant, from, to } = useGlobalQueryParams(['tenant', 'dates']);
  const [, , ordering] = useSortingUrlState();
  const [{ pageIndex, pageSize }] = usePaginationUrlState();
  const page = pageIndex + 1;

  const { data: threat } = useThreatById({ threatId, tenant });
  const { data: activeThreat, isLoading: activeThreatLoading } =
    useGetActiveThreatsQuery(
      { tenant, from, to },
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
    page,
    pageSize,
    ordering,
  });
  const { data: detectionMethods, isLoading: detectionMethodsLoading } =
    useThreatDetectionMethods({ threatId, page, pageSize, ordering });

  if (!threat) return null;

  const assets = activeThreat?.assets;
  const entitiesCount =
    (assets?.victims ?? 0) +
    (assets?.offenders ?? 0) -
    (assets?.bothVictimAndOffender ?? 0);

  return (
    <>
      {family && (
        <OutletBreadcrumb
          link={`${threat.kind === 'compromise' ? '/threats' : '/policy-violations'}/coverage/family/${family.id}`}
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
              value={assets?.newVictims ?? 0}
            />
            <PageStat
              label="Total victims"
              value={assets?.victims ?? 0}
            />
            <PageStat
              label="New offenders"
              value={assets?.newOffenders ?? 0}
            />
            <PageStat
              label="Total offenders"
              value={assets?.offenders ?? 0}
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
