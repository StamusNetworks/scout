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
import { esEscape } from '@/common/lib/strings';
import { useGetBeaconingEventsQuery } from '@/features/events';
import { useGetEventsQuery } from '@/features/events';
import { useGetSightingEventsQuery } from '@/features/events';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useGetRulesQuery } from '@/features/rules';
import { useGetImpactedEntitiesQuery } from '@/features/threats';
import { useGetThreatsStatusQuery } from '@/features/threats';

import { useGetHostWithAlertsQuery } from '../../api/hosts.api';
import { HostDetectionsRadar } from '../host-detections-radar';
import { HostProfile } from '../host-profile';
import { getHostProfileChartData } from '../host-profile.utils';
import { HostSummary } from '../host-summary';

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
  } = useGetHostWithAlertsQuery(
    {
      entity: hostId,
      tenant: params.tenant,
    },
    { skip: !hostId },
  );

  // ── Entity data (feeds HostSummary molecule — kill chain + threats) ─
  const { data: assetsList } = useGetImpactedEntitiesQuery(
    {
      asset: hostId,
      tenant: params.tenant,
      from: params.from,
      to: params.to,
    },
    { skip: !hostId },
  );
  const entity = assetsList?.results?.[0];

  // ── Incidents (feeds HostDetectionsRadar — victim / attacker) ─────
  const { data: incidents } = useGetThreatsStatusQuery(
    {
      page: 1,
      pageSize: 10,
      asset: hostId,
      tenant: params.tenant,
      ordering: undefined,
    },
    { skip: !hostId },
  );

  // ── Detection methods count (feeds HostDetectionsRadar) ───────────
  const { data: detectionMethodsList } = useGetRulesQuery(
    {
      host_id_qfilter: `ip:"${esEscape(hostId)}"`,
      tenant: params.tenant,
      from: params.from,
      to: params.to,
      hits_min: 1,
      ordering: '-hits',
      page: 1,
      pageSize: 10,
    },
    { skip: !hostId },
  );

  // ── Beacons count (feeds HostDetectionsRadar) ─────────────────────
  const { data: beaconingData } = useGetBeaconingEventsQuery(
    {
      tenant: params.tenant,
      from: params.from,
      to: params.to,
      qfilter: `beacon_report.assets:${esEscape(hostId)}`,
      page: 1,
      pageSize: 10,
    },
    { skip: !hostId },
  );

  // ── Sightings count (feeds HostDetectionsRadar) ───────────────────
  const { data: sightingsData } = useGetSightingEventsQuery(
    {
      tenant: params.tenant,
      from: params.from,
      to: params.to,
      qfilter: `discovery.asset:${esEscape(hostId)}`,
      page: 1,
      pageSize: 10,
    },
    { skip: !hostId },
  );

  // ── Outlier events count (feeds HostDetectionsRadar) ──────────────
  const { data: outlierEventsData } = useGetEventsQuery(
    {
      ...params,
      page: 1,
      pageSize: 10,
      qfilter: `(src_ip:"${esEscape(hostId)}" OR dest_ip:"${esEscape(hostId)}") AND stamus_novel:true`,
      stamus: true,
      alert: true,
      discovery: true,
    },
    { skip: !hostId },
  );

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
            incidents?.results.filter((i) => !i.isOffender).length || 0
          }
          threatsAttacker={
            incidents?.results.filter((i) => i.isOffender).length || 0
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
