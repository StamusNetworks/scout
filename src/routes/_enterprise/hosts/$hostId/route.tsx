import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useParams,
} from '@tanstack/react-router';
import { CircleAlert, LaptopMinimal } from 'lucide-react';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Tabs,
  TabsBadge,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/common/design-system/atoms/ui/empty';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { isIP } from '@/common/lib/ips';
import { esEscape } from '@/common/lib/strings';
import { useGetSignaturesQuery } from '@/features/detection-methods/signatures/api/signatures.api';
import { useGetBeaconingEventsQuery } from '@/features/events/beaconing/common/beaconing.api';
import { useGetEventsQuery } from '@/features/events/common/events.api';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { useGetHostWithAlertsQuery } from '@/features/host-insights/common/host-insights.api';
import { HostHeader } from '@/features/host-insights/use-cases/host-details/entities/host-header';
import { useGetThreatsStatusQuery } from '@/features/threats/common/threats.api';
import { selectTenancy } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

export const Route = createFileRoute('/_enterprise/hosts/$hostId')({
  component: () => (
    <PageBoundary key="host-details">
      <HostDetailsLayout />
    </PageBoundary>
  ),
});

function HostDetailsLayout() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const { pathname } = useLocation();

  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { multitenancy } = useAppSelector(selectTenancy);

  const isValidIp = Boolean(hostId && isIP(hostId));

  // ── Host data (gate loading / error states) ──────────────────────
  const {
    data: host,
    isLoading: isLoadingHost,
    isError: isErrorHost,
  } = useGetHostWithAlertsQuery(
    { entity: hostId || '', tenant: params.tenant },
    { skip: !isValidIp },
  );

  // ── Badge count queries (RTK Query deduplicates with HostHeader) ─
  const { data: incidents, isLoading: isLoadingIncidents } =
    useGetThreatsStatusQuery(
      {
        page: 1,
        page_size: 10,
        asset: hostId,
        tenant: params.tenant,
        ordering: undefined,
      },
      { skip: !isValidIp },
    );

  const { data: detectionMethodsList, isLoading: isLoadingDetectionMethods } =
    useGetSignaturesQuery(
      {
        host_id_qfilter: `ip:"${esEscape(hostId ?? '')}"`,
        tenant: params.tenant,
        start_date: params.start_date,
        end_date: params.end_date,
        hits_min: 1,
        ordering: '-hits',
        page: 1,
        page_size: 10,
      },
      { skip: !isValidIp },
    );

  const { data: beaconingData, isLoading: isLoadingBeaconing } =
    useGetBeaconingEventsQuery(
      {
        tenant: params.tenant,
        start_date: params.start_date,
        end_date: params.end_date,
        qfilter: `beacon_report.assets:${esEscape(hostId ?? '')}`,
        page: 1,
        page_size: 10,
      },
      { skip: !isValidIp },
    );

  const { data: sightingsData, isLoading: isLoadingSightings } =
    useGetSightingEventsQuery(
      {
        tenant: params.tenant,
        start_date: params.start_date,
        end_date: params.end_date,
        qfilter: `discovery.asset:${esEscape(hostId ?? '')}`,
        page: 1,
        page_size: 10,
      },
      { skip: !isValidIp },
    );

  const { data: outlierEventsData, isLoading: isLoadingOutlierEvents } =
    useGetEventsQuery(
      {
        ...params,
        page: 1,
        page_size: 10,
        qfilter: `(src_ip:"${esEscape(hostId ?? '')}" OR dest_ip:"${esEscape(hostId ?? '')}") AND stamus_novel:true`,
        stamus: true,
        alert: true,
        discovery: true,
      },
      { skip: !isValidIp },
    );

  const { data: detectionEventsData, isFetching: isFetchingDetectionEvents } =
    useGetEventsQuery(
      {
        ...params,
        page: 1,
        page_size: 10,
        qfilter: `(src_ip:"${esEscape(hostId ?? '')}" OR dest_ip:"${esEscape(hostId ?? '')}")`,
        stamus: true,
        alert: true,
        discovery: true,
      },
      { skip: !isValidIp },
    );

  // ── Invalid IP ───────────────────────────────────────────────────
  if (!isValidIp) {
    return (
      <>
        <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
        <OutletBreadcrumb>{hostId}</OutletBreadcrumb>
        <div className="flex h-full items-center justify-center px-8">
          <Empty className="h-fit w-fit">
            <EmptyMedia variant="icon">
              <CircleAlert />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Invalid IP address</EmptyTitle>
              <EmptyDescription>
                &quot;{hostId}&quot; is not a valid IP address.
              </EmptyDescription>
            </EmptyHeader>
            <Link to={'/hosts' as string}>
              <Button>Back to hosts</Button>
            </Link>
          </Empty>
        </div>
      </>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoadingHost) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  // ── Host not found ───────────────────────────────────────────────
  if (isErrorHost || !host?.host_id) {
    return (
      <>
        <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
        <OutletBreadcrumb>{hostId}</OutletBreadcrumb>
        <div className="flex h-full items-center justify-center px-8">
          <Empty className="h-fit w-fit">
            <EmptyMedia variant="icon">
              <LaptopMinimal />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Host not found</EmptyTitle>
              <EmptyDescription>
                {multitenancy
                  ? 'This host does not exist or you may be on the wrong tenant.'
                  : 'This host does not exist. It may have been removed or the IP address is incorrect.'}
              </EmptyDescription>
            </EmptyHeader>
            <Link to={'/hosts' as string}>
              <Button>Back to hosts</Button>
            </Link>
          </Empty>
        </div>
      </>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────
  return (
    <>
      <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
      <OutletBreadcrumb>{hostId}</OutletBreadcrumb>
      <ScrollArea className="h-full w-full overflow-clip">
        <TogglePageContainer>
          <HostHeader hostId={hostId} />
          <Tabs value={pathname}>
            <TabsList>
              <TabsTrigger
                value={`/hosts/${hostId}`}
                asChild
              >
                <Link
                  to="/hosts/$hostId"
                  params={{ hostId }}
                >
                  Insights
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={`/hosts/${hostId}/timeline`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/timeline"
                  params={{ hostId }}
                >
                  Timeline
                </Link>
              </TabsTrigger>
              <Separator
                orientation="vertical"
                className="bg-foreground/10 dark:bg-foreground/15 mx-1 h-5"
              />
              <TabsTrigger
                value={`/hosts/${hostId}/incidents`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/incidents"
                  params={{ hostId }}
                >
                  Incidents{' '}
                  <TabsBadge
                    count={incidents?.count || 0}
                    isLoading={isLoadingIncidents}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={`/hosts/${hostId}/detection-methods`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/detection-methods"
                  params={{ hostId }}
                >
                  Detection Methods{' '}
                  <TabsBadge
                    count={detectionMethodsList?.count || 0}
                    isLoading={isLoadingDetectionMethods}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={`/hosts/${hostId}/outlier-events`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/outlier-events"
                  params={{ hostId }}
                >
                  Outlier Events{' '}
                  <TabsBadge
                    count={outlierEventsData?.count || 0}
                    isLoading={isLoadingOutlierEvents}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={`/hosts/${hostId}/detection-events`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/detection-events"
                  params={{ hostId }}
                >
                  Detection Events{' '}
                  <TabsBadge
                    count={detectionEventsData?.count || 0}
                    isLoading={isFetchingDetectionEvents}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={`/hosts/${hostId}/sightings`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/sightings"
                  params={{ hostId }}
                >
                  Sightings{' '}
                  <TabsBadge
                    count={sightingsData?.count || 0}
                    isLoading={isLoadingSightings}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={`/hosts/${hostId}/beacons`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/beacons"
                  params={{ hostId }}
                >
                  Beacons{' '}
                  <TabsBadge
                    count={beaconingData?.count || 0}
                    isLoading={isLoadingBeaconing}
                  />
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-2">
            <Outlet />
          </div>
        </TogglePageContainer>
      </ScrollArea>
    </>
  );
}
