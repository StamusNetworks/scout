import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Page } from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { TogglePageContainer } from '@/features/app-shell';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import {
  FamilyActiveThreats,
  ThreatFamilyHeader,
  ThreatFamilyTabs,
  useThreatFamilyOverview,
} from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId',
)({
  component: () => (
    <PageBoundary key="threat-family-by-id">
      <OutletBreadcrumb link="/threats/coverage">Coverage</OutletBreadcrumb>
      <ThreatFamilyPage />
    </PageBoundary>
  ),
});

function ThreatFamilyPage() {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  const { tenant, start_date, end_date } = useGlobalQueryParams([
    'tenant',
    'dates',
  ]);
  const [pagination] = usePaginationUrlState();
  const [, , ordering] = useSortingUrlState();

  const {
    family,
    activeFamily,
    activeFamilyLoading,
    eventsCount,
    eventsLoading,
    detectionMethodsCount,
    detectionMethodsLoading,
  } = useThreatFamilyOverview({
    familyId: parseInt(familyId),
    tenant,
    startDate: start_date,
    endDate: end_date,
    pagination,
    ordering,
  });

  if (!family) return null;

  const assets = activeFamily?.assets;
  const entitiesCount =
    (assets?.victims ?? 0) +
    (assets?.offenders ?? 0) -
    (assets?.bothVictimAndOffender ?? 0);

  return (
    <>
      <OutletBreadcrumb>{family.name}</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <ThreatFamilyHeader
            family={family}
            activeFamily={activeFamily}
          />
          <FamilyActiveThreats familyId={family.id} />
          <ThreatFamilyTabs
            family={family}
            entitiesCount={entitiesCount}
            entitiesLoading={activeFamilyLoading}
            detectionMethodsCount={detectionMethodsCount}
            detectionMethodsLoading={detectionMethodsLoading}
            eventsCount={eventsCount}
            eventsLoading={eventsLoading}
          />
          <div className="pt-4">
            <Outlet />
          </div>
        </TogglePageContainer>
      </Page>
    </>
  );
}
