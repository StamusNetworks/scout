import { useAppSelector } from '@/store/store';

import { selectEventsTypesParams } from '../../query-filters/store/query-filters.selector';
import { useGetAutoDateRangeQuery } from '../api/dates-filters.api';

export const useAutoRange = () => {
  const params = useAppSelector(selectEventsTypesParams);
  return useGetAutoDateRangeQuery(params);
};
