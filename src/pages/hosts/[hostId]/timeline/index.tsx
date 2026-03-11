import { useParams } from '@tanstack/react-router';
import { Biohazard, History } from 'lucide-react';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { useGetThreatHistoryQuery } from '@/features/hunt/timeline/api/timeline.api';
import { HostTimelineTemplate } from '@/features/hunt/timeline/components/history-timeline/history-timeline';
import { ThreatsTimeline } from '@/features/hunt/timeline/components/timeline/timeline';

export const HostTimeline = () => {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: host } = useGetHostWithAlertsQuery({
    entity: hostId || '',
    tenant: params.tenant,
  });
  const { data: threatHistoryData } = useGetThreatHistoryQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    asset: hostId,
  });
  return (
    <>
      <BlockTitle className="mt-4">
        <Biohazard />
        Threats timeline
      </BlockTitle>
      <ThreatsTimeline entity={hostId} />
      <BlockTitle className="mt-8">
        <History /> Host History
      </BlockTitle>
      <HostTimelineTemplate
        host_id={host?.host_id}
        threatHistory={threatHistoryData?.results[0]?.history}
      />
    </>
  );
};
