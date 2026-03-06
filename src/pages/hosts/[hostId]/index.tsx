import { CircleAlert, LaptopMinimal } from 'lucide-react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';

import { Row } from '@/common/design-system/atoms/layout/row';
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
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { isIP } from '@/common/lib/ips';
import { esEscape } from '@/common/lib/strings';
import { useGetBeaconingEventsQuery } from '@/features/analytics/beaconing/api/beaconing.api';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { HostDetectionsRadar } from '@/features/analytics/hosts/components/host-detections-radar/host-detections-radar';
import { HostSummary } from '@/features/analytics/hosts/components/host-summary/host-summary';
import { HostProfile } from '@/features/analytics/hosts/components/hostProfile/hostProfile';
import { getHostProfileChartData } from '@/features/analytics/hosts/components/hostProfile/hostProfile.utils';
import { useGetSightingEventsQuery } from '@/features/analytics/sightings/api/sightings.api';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import { useGetImpactedEntitiesQuery } from '@/features/hunt/entities/api/entities.api';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';
import { selectTenancy } from '@/features/user/tenancy/tenancy.selector';
import { routes } from '@/pages/routes.config';
import { useAppSelector } from '@/store/store';

export const HostDetails = () => {
  const { hostId } = useParams();
  const { pathname } = useLocation();

  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { multitenancy } = useAppSelector(selectTenancy);

  const isValidIp = Boolean(hostId && isIP(hostId));

  const {
    data: host,
    isLoading: isLoadingHost,
    isError: isErrorHost,
  } = useGetHostWithAlertsQuery(
    { entity: hostId || '', tenant: params.tenant },
    { skip: !isValidIp },
  );
  const hostProfileData = getHostProfileChartData(host);

  const { data: assetsList } = useGetImpactedEntitiesQuery(
    {
      asset: hostId || '',
      tenant: params.tenant,
      start_date: params.start_date,
      end_date: params.end_date,
    },
    { skip: !isValidIp },
  );
  const entity = assetsList?.results?.[0];

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

  if (!isValidIp) {
    return (
      <>
        <OutletBreadcrumb link={routes.hosts}>Hosts</OutletBreadcrumb>
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
            <Link to={routes.hosts}>
              <Button>Back to hosts</Button>
            </Link>
          </Empty>
        </div>
      </>
    );
  }

  if (isLoadingHost) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (isErrorHost || !host?.host_id) {
    return (
      <>
        <OutletBreadcrumb link={routes.hosts}>Hosts</OutletBreadcrumb>
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
            <Link to={routes.hosts}>
              <Button>Back to hosts</Button>
            </Link>
          </Empty>
        </div>
      </>
    );
  }

  return (
    <>
      <OutletBreadcrumb link={routes.hosts}>Hosts</OutletBreadcrumb>
      <OutletBreadcrumb>{hostId}</OutletBreadcrumb>
      <ScrollArea className="h-full w-full overflow-clip">
        <TogglePageContainer>
          <Row className="mb-4 justify-between">
            <HostSummary
              entity={entity}
              host={host}
              hostId={hostId}
            />
            <div className="h-fit max-w-[450px] grow">
              <HostDetectionsRadar
                threatsVictim={
                  incidents?.results.filter(
                    (i) => i.kill_chain_offender === null,
                  ).length || 0
                }
                threatsAttacker={
                  incidents?.results.filter(
                    (i) => i.kill_chain_offender !== null,
                  ).length || 0
                }
                beacons={beaconingData?.count || 0}
                detectionMethods={detectionMethodsList?.count || 0}
                sightings={sightingsData?.count || 0}
                outlierEvents={outlierEventsData?.count || 0}
              />
            </div>
            <div className="h-fit max-w-[450px] grow">
              <HostProfile data={hostProfileData} />
            </div>
          </Row>
          <Tabs value={pathname}>
            <TabsList>
              <TabsTrigger
                value={getUrl(routes.hosts_host, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host, hostId!)}>Insights</Link>
              </TabsTrigger>
              <TabsTrigger
                value={getUrl(routes.hosts_host_timeline, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_timeline, hostId!)}>
                  Timeline
                </Link>
              </TabsTrigger>
              <Separator
                orientation="vertical"
                className="bg-foreground/10 dark:bg-foreground/15 mx-1 h-5"
              />
              <TabsTrigger
                value={getUrl(routes.hosts_host_incidents, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_incidents, hostId!)}>
                  Incidents{' '}
                  <TabsBadge
                    count={incidents?.count || 0}
                    isLoading={isLoadingIncidents}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={getUrl(routes.hosts_host_detection_methods, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_detection_methods, hostId!)}>
                  Detection Methods{' '}
                  <TabsBadge
                    count={detectionMethodsList?.count || 0}
                    isLoading={isLoadingDetectionMethods}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={getUrl(routes.hosts_host_outlierevents, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_outlierevents, hostId!)}>
                  Outlier Events{' '}
                  <TabsBadge
                    count={outlierEventsData?.count || 0}
                    isLoading={isLoadingOutlierEvents}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={getUrl(routes.hosts_host_detectionevents, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_detectionevents, hostId!)}>
                  Detection Events{' '}
                  <TabsBadge
                    count={detectionEventsData?.count || 0}
                    isLoading={isFetchingDetectionEvents}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={getUrl(routes.hosts_host_sightings, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_sightings, hostId!)}>
                  Sightings{' '}
                  <TabsBadge
                    count={sightingsData?.count || 0}
                    isLoading={isLoadingSightings}
                  />
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value={getUrl(routes.hosts_host_beacons, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_beacons, hostId!)}>
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
};

const getUrl = (route: string, hostId: string) =>
  route.replace(':hostId', hostId);
