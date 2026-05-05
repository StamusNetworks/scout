import { computeDates, useDates } from '@/features/dates';
import { useTenant } from '@/features/tenancy';
import { useAppSelector } from '@/store/store';

import { useBuildEventsQfilter } from '../hooks/use-build-events-qfilter';
import { useBuildHostIdQfilter } from '../hooks/use-build-host-id-qfilter';
import { useBuildSignatureFilter } from '../hooks/use-build-signature-params';
import type { QueryFilterState } from '../model/query-filter';
import { selectEventTypeFlagsParams } from '../state/query-filters.selectors';

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
