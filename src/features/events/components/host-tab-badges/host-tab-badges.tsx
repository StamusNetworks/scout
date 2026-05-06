import { TabsBadge } from '@/common/design-system/atoms/ui/border-tabs';
import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import {
  useGetBeaconingEventsQuery,
  useGetEventsQuery,
  useGetSightingEventsQuery,
} from '../../api/events.api';

type Props = { hostId: string };

const COUNT_QUERY = { page: 1, pageSize: 1 } as const;

export const HostBeaconsTabBadge = ({ hostId }: Props) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isLoading } = useGetBeaconingEventsQuery({
    ...params,
    ...COUNT_QUERY,
    qfilter: `beacon_report.assets:${esEscape(hostId)}`,
  });
  return (
    <TabsBadge
      count={data?.count ?? 0}
      isLoading={isLoading}
    />
  );
};

export const HostSightingsTabBadge = ({ hostId }: Props) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isLoading } = useGetSightingEventsQuery({
    ...params,
    ...COUNT_QUERY,
    qfilter: `discovery.asset:${esEscape(hostId)}`,
  });
  return (
    <TabsBadge
      count={data?.count ?? 0}
      isLoading={isLoading}
    />
  );
};

export const HostOutlierEventsTabBadge = ({ hostId }: Props) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const escaped = esEscape(hostId);
  const { data, isLoading } = useGetEventsQuery({
    ...params,
    ...COUNT_QUERY,
    qfilter: `(src_ip:"${escaped}" OR dest_ip:"${escaped}") AND stamus_novel:true`,
    stamus: true,
    alert: true,
    discovery: true,
  });
  return (
    <TabsBadge
      count={data?.count ?? 0}
      isLoading={isLoading}
    />
  );
};

export const HostDetectionEventsTabBadge = ({ hostId }: Props) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const escaped = esEscape(hostId);
  const { data, isFetching } = useGetEventsQuery({
    ...params,
    ...COUNT_QUERY,
    qfilter: `(src_ip:"${escaped}" OR dest_ip:"${escaped}")`,
    stamus: true,
    alert: true,
    discovery: true,
  });
  return (
    <TabsBadge
      count={data?.count ?? 0}
      isLoading={isFetching}
    />
  );
};
