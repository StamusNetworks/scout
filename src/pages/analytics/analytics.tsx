import { Link, useLocation } from '@tanstack/react-router';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import {
  Tabs,
  TabsBadge,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetBeaconingEventsQuery } from '@/features/analytics/beaconing/api/beaconing.api';
import { useGetSightingEventsQuery } from '@/features/analytics/sightings/api/sightings.api';

export const Analytics = ({ children }: { children: React.ReactNode }) => {
  const pathname = useLocation().pathname;
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: ipsData, isLoading: ipsIsLoading } = useGetBeaconingEventsQuery(
    {
      ...params,
      pageIndex: 0,
      pageSize: 10,
      qfilter: 'beacon_report.document_type:agg_serving_ip',
    },
  );
  const { data: ja3sData, isLoading: ja3sIsLoading } =
    useGetBeaconingEventsQuery({
      ...params,
      pageIndex: 0,
      pageSize: 10,
      qfilter: 'beacon_report.document_type:agg_ja3s_src_only',
    });
  const { data: sightingsData, isLoading: sightingsIsLoading } =
    useGetSightingEventsQuery({
      ...params,
      pageIndex: 0,
      pageSize: 10,
    });

  return (
    <DefaultPage
      title="Analytics"
      description="Gain insights on TLS beaconing and Sightings discovered on the network. Sightings events are identifying never observed before metadata, such as a HTTP User-Agent, a domain name, a JA4 hash, …"
    >
      <Tabs value={pathname}>
        <TabsList className="mb-2">
          <TabsTrigger
            value={
              pathname === '/analytics/beaconing/ips'
                ? '/analytics/beaconing/ips'
                : '/analytics'
            }
            asChild
          >
            <Link to="/analytics/beaconing/ips">
              Beaconing IPs
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
              Beaconing JA3s
              <TabsBadge
                count={ja3sData?.count || 0}
                isLoading={ja3sIsLoading}
              />
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="/analytics/sightings"
            asChild
          >
            <Link to="/analytics/sightings">
              Sightings
              <TabsBadge
                count={sightingsData?.count || 0}
                isLoading={sightingsIsLoading}
              />
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div>{children}</div>
    </DefaultPage>
  );
};
