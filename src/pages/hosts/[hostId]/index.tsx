import { Link, Outlet, useLocation, useParams } from 'react-router-dom';

import { Container } from '@/common/design-system/atoms/layout/container';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Tabs,
  TabsBadge,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
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
import { routes } from '@/pages/routes.config';

export const HostDetails = () => {
  const { hostId } = useParams();
  const { pathname } = useLocation();

  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: host } = useGetHostWithAlertsQuery({
    entity: hostId || '',
    tenant: params.tenant,
  });
  const hostProfileData = getHostProfileChartData(host);

  const { data: assetsList } = useGetImpactedEntitiesQuery({
    asset: hostId || '',
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  const entity = assetsList?.results?.[0];

  const { data: incidents, isLoading: isLoadingIncidents } =
    useGetThreatsStatusQuery({
      page: 1,
      page_size: 10,
      asset: hostId,
      tenant: params.tenant,
      ordering: undefined,
    });

  const { data: detectionMethodsList, isLoading: isLoadingDetectionMethods } =
    useGetSignaturesQuery({
      host_id_qfilter: `ip:"${hostId}"`,
      tenant: params.tenant,
      start_date: params.start_date,
      end_date: params.end_date,
      hits_min: 1,
      ordering: '-hits',
      page: 1,
      page_size: 10,
    });

  const { data: beaconingData, isLoading: isLoadingBeaconing } =
    useGetBeaconingEventsQuery({
      tenant: params.tenant,
      start_date: params.start_date,
      end_date: params.end_date,
      qfilter: `beacon_report.assets:${hostId}`,
      page: 1,
      page_size: 10,
    });

  const { data: sightingsData, isLoading: isLoadingSightings } =
    useGetSightingEventsQuery({
      tenant: params.tenant,
      start_date: params.start_date,
      end_date: params.end_date,
      qfilter: `discovery.asset:${hostId}`,
      page: 1,
      page_size: 10,
    });

  const { data: outlierEventsData, isLoading: isLoadingOutlierEvents } =
    useGetEventsQuery({
      ...params,
      page: 1,
      page_size: 10,
      qfilter: `stamus.asset:"${hostId}" AND stamus_novel:true`,
      stamus: true,
      alert: true,
      discovery: true,
    });

  const { data: detectionEventsData, isFetching: isFetchingDetectionEvents } =
    useGetEventsQuery({
      ...params,
      page: 1,
      page_size: 10,
      qfilter: `stamus.asset:"${hostId}"`,
      stamus: true,
      alert: true,
      discovery: true,
    });

  return (
    <>
      <OutletBreadcrumb link={routes.hosts}>Hosts</OutletBreadcrumb>
      <OutletBreadcrumb>{hostId}</OutletBreadcrumb>
      <ScrollArea className="h-full w-full overflow-clip">
        <Container className="@container/app py-3 pb-[75px]">
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
              <TabsTrigger
                value={getUrl(routes.hosts_host_timeline, hostId!)}
                asChild
              >
                <Link to={getUrl(routes.hosts_host_timeline, hostId!)}>
                  Timeline
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-2">
            <Outlet />
          </div>
        </Container>
      </ScrollArea>
    </>
  );
};

const getUrl = (route: string, hostId: string) =>
  route.replace(':hostId', hostId);
