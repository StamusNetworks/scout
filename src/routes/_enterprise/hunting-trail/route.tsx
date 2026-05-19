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
} from '@/common/design-system/atoms/ui/pill-tabs';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { formatNumber } from '@/common/lib/numbers';
import { usePageTitle } from '@/common/lib/use-page-title';
import { TogglePageContainer } from '@/features/app-shell';
import {
  HUNTING_TRAIL_DOCS_URL,
  NetworkHuntingTrailProvider,
  PURPOSE_SLUGS,
  RunBanner,
  useHuntingTrail,
} from '@/features/hunting-trail';
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
  const { from, to } = useGlobalQueryParams(['dates']);
  const { groups, runStats, queryMetadata } = useHuntingTrail({
    from,
    to,
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
          <RunBanner
            total={runStats.total}
            withResults={runStats.withResults}
            docsUrl={HUNTING_TRAIL_DOCS_URL}
          />
          <Tabs value={pathname}>
            <TabsList>
              <TabsTrigger
                value="/hunting-trail/summary"
                asChild
              >
                <Link to="/hunting-trail/summary">Summary</Link>
              </TabsTrigger>
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
            <NetworkHuntingTrailProvider value={{ groups, queryMetadata }}>
              <Outlet />
            </NetworkHuntingTrailProvider>
          </div>
        </TogglePageContainer>
      </Page>
    </>
  );
}
