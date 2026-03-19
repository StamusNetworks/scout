import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

import { selectEventsTypesParams } from '../../../filters/query-filters/query-filters.selectors';
import { useGetAutoDateRangeQuery } from '../../dates.api';

export const useAutoRange = () => {
  const params = useAppSelector(selectEventsTypesParams);
  const tenant = useAppSelector(selectTenant);
  return useGetAutoDateRangeQuery(
    { ...params, tenant },
    { refetchOnMountOrArgChange: true },
  );
};
