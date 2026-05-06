import { TabsBadge } from '@/common/design-system/atoms/ui/border-tabs';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetThreatsStatusQuery } from '../../api/threats.api';

export const HostIncidentsTabBadge = ({ hostId }: { hostId: string }) => {
  const { tenant } = useGlobalQueryParams(['tenant']);
  const { data, isLoading } = useGetThreatsStatusQuery({
    page: 1,
    pageSize: 1,
    asset: hostId,
    tenant,
    ordering: undefined,
  });
  return (
    <TabsBadge
      count={data?.count ?? 0}
      isLoading={isLoading}
    />
  );
};
