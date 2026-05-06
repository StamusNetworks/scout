import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from '@tanstack/react-router';

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Tabs,
  TabsBadge,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/features/app-shell';
import { useGetBeaconingEventsQuery } from '@/features/events';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

export const Route = createFileRoute('/_enterprise/analytics/beaconing')({
  component: BeaconingLayout,
});

function BeaconingLayout() {
  const pathname = useLocation().pathname;
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: ipsData, isLoading: ipsIsLoading } = useGetBeaconingEventsQuery(
    {
      ...params,
      page: 1,
      pageSize: 10,
      qfilter: 'beacon_report.document_type:agg_serving_ip',
    },
  );

  const { data: ja3sData, isLoading: ja3sIsLoading } =
    useGetBeaconingEventsQuery({
      ...params,
      page: 1,
      pageSize: 10,
      qfilter: 'beacon_report.document_type:agg_ja3s_src_only',
    });

  return (
    <Page>
      <OutletBreadcrumb>Beaconing</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Beaconing</PageTitle>
            <PageDescription>
              Gain insights on TLS beaconing discovered on the network.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <Tabs value={pathname}>
          <TabsList className="mb-2">
            <TabsTrigger
              value={
                pathname === '/analytics/beaconing/ips'
                  ? '/analytics/beaconing/ips'
                  : '/analytics/beaconing'
              }
              asChild
            >
              <Link to="/analytics/beaconing/ips">
                IPs
                <TabsBadge
                  count={ipsData?.count || 0}
                  isLoading={ipsIsLoading}
                />
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value="/analytics/beaconing/ja3s"
              asChild
            >
              <Link to="/analytics/beaconing/ja3s">
                JA3S
                <TabsBadge
                  count={ja3sData?.count || 0}
                  isLoading={ja3sIsLoading}
                />
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div>
          <Outlet />
        </div>
      </TogglePageContainer>
    </Page>
  );
}
