import { PaginationState } from '@tanstack/react-table';

import { useGetEventsQuery } from '@/features/events/common/events.api';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

export const useEvents = (pagination: PaginationState) => {
  const params = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);
  return useGetEventsQuery({
    ...params,
    ...pagination,
  });
};
