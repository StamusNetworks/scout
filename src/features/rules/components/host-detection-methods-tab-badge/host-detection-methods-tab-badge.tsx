import { TabsBadge } from '@/common/design-system/atoms/ui/border-tabs';
import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetRulesQuery } from '../../api/rules.api';

export const HostDetectionMethodsTabBadge = ({
  hostId,
}: {
  hostId: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isLoading } = useGetRulesQuery({
    host_id_qfilter: `ip:"${esEscape(hostId)}"`,
    tenant: params.tenant,
    from: params.from,
    to: params.to,
    hits_min: 1,
    ordering: '-hits',
    page: 1,
    pageSize: 1,
  });
  return (
    <TabsBadge
      count={data?.count ?? 0}
      isLoading={isLoading}
    />
  );
};
