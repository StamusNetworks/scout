import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetEventsQuery } from '../events.api';

export const useEvents = (pagination: PaginationState) => {
  const params = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);
  return useGetEventsQuery({
    ...params,
    ...pagination,
  });
};
