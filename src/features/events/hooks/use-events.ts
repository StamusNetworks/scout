import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsQuery } from '../api/events.api';

interface UseEventsParams {
  page: number;
  pageSize: number;
}

export const useEvents = ({ page, pageSize }: UseEventsParams) => {
  const params = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);
  return useGetEventsQuery({
    ...params,
    page,
    pageSize,
  });
};
