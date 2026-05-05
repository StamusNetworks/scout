import { computeDates, useDates } from '@/features/dates';
import { useTenant } from '@/features/tenancy';
import { useAppSelector } from '@/store/store';

import type { QueryFilterState } from '../query-filter.model';
import { selectEventTypeFlagsParams } from '../query-filters.selectors';
import { useBuildHostIdQfilter } from '../use-cases/build-host-id-qfilter/build-host-id-qfilter';
import { useBuildEventsQfilter } from '../use-cases/build-qfilter/build-qfilter';
import { useBuildSignatureFilter } from '../use-cases/build-signature-filter/build-signature-filter';

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
  const dates = useDates();
  const tenant = useTenant();
  const eventTypes = useAppSelector(selectEventTypeFlagsParams);
  const qfilter = useBuildEventsQfilter(options?.extendQfilter);
  const hostIdQfilter = useBuildHostIdQfilter(options?.extendQfilter);
  const signatureFilters = useBuildSignatureFilter(options?.extendQfilter);
  const computedDates = computeDates(dates);

  return {
    ...(subscribe?.includes('dates') && {
      start_date: computedDates.start_date,
      end_date: computedDates.end_date,
    }),
    ...(subscribe?.includes('qfilter') && {
      qfilter,
      ...eventTypes,
    }),
    ...(subscribe?.includes('qfilterHost') && {
      host_id_qfilter: hostIdQfilter,
    }),
    ...(subscribe?.includes('qfilterSignature') && signatureFilters),
    ...(subscribe?.includes('tenant') && { tenant }),
  };
};
