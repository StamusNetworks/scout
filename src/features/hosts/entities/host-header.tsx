/**
 * HostHeader entity — fetches and displays the host summary area.
 *
 * This is an *entity* component: it accepts only `hostId`, fetches all the data
 * it needs, and renders the full header section (HostSummary molecule +
 * HostDetectionsRadar + HostProfile).
 *
 * The existing presentational HostSummary molecule at
 * `features/analytics/hosts/components/host-summary/` remains untouched.
 */
import { Row } from '@/common/design-system/atoms/layout/row';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetBeaconingEventsQuery } from '@/features/analytics/beaconing/api/beaconing.api';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { HostDetectionsRadar } from '@/features/analytics/hosts/components/host-detections-radar/host-detections-radar';
import { HostSummary } from '@/features/analytics/hosts/components/host-summary/host-summary';
import { HostProfile } from '@/features/analytics/hosts/components/hostProfile/hostProfile';
import { getHostProfileChartData } from '@/features/analytics/hosts/components/hostProfile/hostProfile.utils';
import { useGetSightingEventsQuery } from '@/features/analytics/sightings/api/sightings.api';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import { useGetImpactedEntityQuery } from '@/features/hunt/entities/api/entities.api';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';

export interface HostHeaderProps {
  hostId: string;
}

export const HostHeader = ({ hostId }: HostHeaderProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  // ── Host data (feeds HostSummary molecule + HostProfile) ──────────
  const {
    data: host,
    isLoading: isLoadingHost,
    isError: isErrorHost,
  } = useGetHostWithAlertsQuery({
    entity: hostId,
    tenant: params.tenant,
  });

  // ── Entity data (feeds HostSummary molecule — kill chain + threats) ─
  const { data: entity } = useGetImpactedEntityQuery({
    asset: hostId,
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
  });

  // ── Incidents (feeds HostDetectionsRadar — victim / attacker) ─────
  const { data: incidents } = useGetThreatsStatusQuery({
    page: 1,
    page_size: 10,
    asset: hostId,
    tenant: params.tenant,
    ordering: undefined,
  });

  // ── Detection methods count (feeds HostDetectionsRadar) ───────────
  const { data: detectionMethodsList } = useGetSignaturesQuery({
    host_id_qfilter: `ip:"${esEscape(hostId)}"`,
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    hits_min: 1,
    ordering: '-hits',
    page: 1,
    page_size: 10,
  });

  // ── Beacons count (feeds HostDetectionsRadar) ─────────────────────
  const { data: beaconingData } = useGetBeaconingEventsQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    qfilter: `beacon_report.assets:${esEscape(hostId)}`,
    page: 1,
    page_size: 10,
  });

  // ── Sightings count (feeds HostDetectionsRadar) ───────────────────
  const { data: sightingsData } = useGetSightingEventsQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    qfilter: `discovery.asset:${esEscape(hostId)}`,
    page: 1,
    page_size: 10,
  });

  // ── Outlier events count (feeds HostDetectionsRadar) ──────────────
  const { data: outlierEventsData } = useGetEventsQuery({
    ...params,
    page: 1,
    page_size: 10,
    qfilter: `(src_ip:"${esEscape(hostId)}" OR dest_ip:"${esEscape(hostId)}") AND stamus_novel:true`,
    stamus: true,
    alert: true,
    discovery: true,
  });

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoadingHost) {
    return (
      <div
        className="flex h-48 w-full items-center justify-center"
        data-testid="host-header-loading"
      >
        <Spin />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (isErrorHost || !host?.host_id) {
    return null;
  }

  // ── Derived data ──────────────────────────────────────────────────
  const hostProfileData = getHostProfileChartData(host);

  return (
    <Row
      className="mb-4 justify-between"
      data-testid="host-header"
    >
      <HostSummary
        entity={entity}
        host={host}
        hostId={hostId}
      />
      <div className="h-fit max-w-[450px] grow">
        <HostDetectionsRadar
          threatsVictim={
            incidents?.results.filter((i) => i.kill_chain_offender === null)
              .length || 0
          }
          threatsAttacker={
            incidents?.results.filter((i) => i.kill_chain_offender !== null)
              .length || 0
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
  );
};
