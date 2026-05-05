import { Biohazard, History } from 'lucide-react';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGetHostWithAlertsQuery } from '@/features/host-insights/api/hosts.api';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import {
  Timeline,
  HostTimelineTemplate,
  useGetThreatHistoryQuery,
} from '@/features/threats';

export interface HostTimelineProps {
  hostId: string;
}

export function HostTimeline({ hostId }: HostTimelineProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const {
    data: hostData,
    isLoading: isHostLoading,
    isError: isHostError,
  } = useGetHostWithAlertsQuery({
    entity: hostId,
    tenant: params.tenant,
  });

  const {
    data: threatHistoryData,
    isLoading: isThreatHistoryLoading,
    isError: isThreatHistoryError,
  } = useGetThreatHistoryQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    asset: hostId,
  });

  const isLoading = isHostLoading || isThreatHistoryLoading;
  const isError = isHostError || isThreatHistoryError;

  if (isLoading) {
    return (
      <div
        className="flex h-48 w-full items-center justify-center"
        data-testid="host-timeline-loading"
      >
        <Spin />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <>
      <BlockTitle className="mt-4">
        <Biohazard />
        Threats timeline
      </BlockTitle>
      <Timeline entity={hostId} />
      <BlockTitle className="mt-8">
        <History /> Host History
      </BlockTitle>
      <HostTimelineTemplate
        host_id={hostData?.host_id}
        threatHistory={threatHistoryData?.results[0]?.history}
      />
    </>
  );
}
