import { useTenant } from '@/features/tenancy';
import { useAppSelector } from '@/store/store';

import { selectEventsTypesParams } from '../../../filters/query-filters/query-filters.selectors';
import { useGetAutoDateRangeQuery } from '../../dates.api';

export const useAutoRange = () => {
  const params = useAppSelector(selectEventsTypesParams);
  const tenant = useTenant();
  return useGetAutoDateRangeQuery(
    { ...params, tenant },
    { refetchOnMountOrArgChange: true },
  );
};
