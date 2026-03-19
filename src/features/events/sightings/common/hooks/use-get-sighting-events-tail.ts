import { useGetEventsTailQuery } from '@/features/events/common/events.api';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import { getSightingQfilter } from '../utils/get-sighting-qfilter';

interface useGetSightingEventsTailProps {
  key: string | undefined;
  value: string | undefined;
  protocol: string | undefined;
}
export const useGetSightingEventsTail = ({
  key,
  value,
  protocol,
}: useGetSightingEventsTailProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const qfilter = getSightingQfilter(key, value, protocol);
  return useGetEventsTailQuery(
    {
      ...params,
      qfilter,
    },
    {
      skip: !qfilter,
    },
  );
};
