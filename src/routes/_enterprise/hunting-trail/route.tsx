import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { formatNumber } from '@/common/lib/numbers';
import { usePageTitle } from '@/common/lib/use-page-title';
import { PURPOSE_SLUGS } from '@/features/hunting-trail/hunting-trail.model';
import { NetworkHuntingTrailProvider } from '@/features/hunting-trail/use-cases/network-hunting-trail/network-hunting-trail-context';
import { useNetworkHuntingTrail } from '@/features/hunting-trail/use-cases/network-hunting-trail/use-network-hunting-trail';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

export const Route = createFileRoute('/_enterprise/hunting-trail')({
  component: () => (
    <PageBoundary key="hunting-trail">
      <HuntingTrailLayout />
    </PageBoundary>
  ),
});

function HuntingTrailLayout() {
  usePageTitle('Hunting Trail');
  const { pathname } = useLocation();
  const { start_date, end_date } = useGlobalQueryParams(['dates']);
  const { groups } = useNetworkHuntingTrail({
    startDate: start_date,
    endDate: end_date,
  });

  return (
    <>
      <OutletBreadcrumb>Hunting Trail</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Hunting Trail</PageTitle>
              <PageDescription>
                Network-wide hunting signals grouped by purpose. Scan the badges
                to see where interesting activity concentrates, then drill into
                specific events.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <Tabs value={pathname}>
            <TabsList>
              {PURPOSE_SLUGS.map(({ slug, label }) => {
                const group = groups[slug];
                return (
                  <TabsTrigger
                    key={slug}
                    value={`/hunting-trail/${slug}`}
                    asChild
                  >
                    <Link to={`/hunting-trail/${slug}` as string}>
                      {label}
                      {group.isLoading ? (
                        <Spin className="ml-2 h-3 w-3 animate-spin" />
                      ) : (
                        group.count > 0 && (
                          <Badge
                            className="ml-2 min-w-5 px-1"
                            variant="discreet"
                          >
                            {formatNumber(group.count)}
                          </Badge>
                        )
                      )}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <div className="mt-4">
            <NetworkHuntingTrailProvider value={{ groups }}>
              <Outlet />
            </NetworkHuntingTrailProvider>
          </div>
        </TogglePageContainer>
      </Page>
    </>
  );
}
