import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsTailQuery } from '../api/events.api';
import { buildSightingQfilter } from '../builders/build-sighting-qfilter';

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
  const qfilter = buildSightingQfilter(key, value, protocol);
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
