import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

import { selectEventsTypesParams } from '../../query-filters/store/query-filters.selector';
import { useGetAutoDateRangeQuery } from '../api/dates-filters.api';

export const useAutoRange = () => {
  const params = useAppSelector(selectEventsTypesParams);
  const tenant = useAppSelector(selectTenant);
  return useGetAutoDateRangeQuery({ ...params, tenant });
};
