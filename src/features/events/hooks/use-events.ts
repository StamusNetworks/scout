import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsQuery } from '../api/events.api';

export const useEvents = (pagination: PaginationState) => {
  const params = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);
  return useGetEventsQuery({
    ...params,
    ...pagination,
  });
};
