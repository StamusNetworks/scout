import { PaginationState } from '@tanstack/react-table';

import { useGetEventsQuery } from '@/features/events/common/events.api';
import { useQFBuilder } from '@/features/filtering/filters/query-filters/hooks/use-qf-builder';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

interface UseFamilyEventsParams {
  familyId: string;
  pagination: PaginationState;
  ordering?: string;
}

export const useFamilyEvents = ({
  familyId,
  pagination,
  ordering,
}: UseFamilyEventsParams) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetEventsQuery(
    {
      ...params,
      ...pagination,
      alert: true,
      stamus: true,
      discovery: true,
      ordering,
      qfilter: QFBuilder.toQFString(
        [QFBuilder.createFilter('stamus.family_id', familyId!)],
        {
          untagged: true,
          informational: true,
          relevant: true,
        },
      ),
    },
    {
      skip: !familyId,
    },
  );
};
