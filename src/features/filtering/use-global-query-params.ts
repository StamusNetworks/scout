import { useAppSelector } from '@/store/store';

import { useDatesRepository } from './dates/dates.repository';
import { computeDates } from './dates/dates.selectors';
import type { QueryFilterState } from './filters/query-filters/query-filter.model';
import { selectEventsTypesParams } from './filters/query-filters/query-filters.selectors';
import { useBuildHostIdQfilter } from './filters/query-filters/use-cases/build-host-id-qfilter/build-host-id-qfilter';
import { useBuildEventsQfilter } from './filters/query-filters/use-cases/build-qfilter/build-qfilter';
import { useBuildSignatureFilter } from './filters/query-filters/use-cases/build-signature-filter/build-signature-filter';
import { useTenantRepository } from './tenant/tenant.repository';

type SubscribeKey =
  | 'dates'
  | 'tenant'
  | 'qfilter'
  | 'qfilterHost'
  | 'qfilterSignature';

export const useGlobalQueryParams = (
  subscribe?: SubscribeKey[],
  options?: {
    extendQfilter?: QueryFilterState[];
  },
) => {
  const dates = useDatesRepository();
  const tenant = useTenantRepository();
  const eventsTypes = useAppSelector(selectEventsTypesParams);
  const qfilter = useBuildEventsQfilter(options?.extendQfilter);
  const hostIdQfilter = useBuildHostIdQfilter(options?.extendQfilter);
  const signatureFilters = useBuildSignatureFilter(options?.extendQfilter);
  const computedDates = computeDates(dates.getAll());

  return {
    ...(subscribe?.includes('dates') && {
      start_date: computedDates.start_date,
      end_date: computedDates.end_date,
    }),
    ...(subscribe?.includes('qfilter') && {
      qfilter,
      ...eventsTypes,
    }),
    ...(subscribe?.includes('qfilterHost') && {
      host_id_qfilter: hostIdQfilter,
    }),
    ...(subscribe?.includes('qfilterSignature') && signatureFilters),
    ...(subscribe?.includes('tenant') && { tenant: tenant.get() }),
  };
};
