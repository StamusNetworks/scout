import { useMemo } from 'react';

import { esEscape } from '@/common/lib/strings';
import { useQFBuilder } from '@/features/filtering/filters/query-filters/hooks/use-qf-builder';
import { selectInvestigationFilter } from '@/features/investigation/investigation.slice';
import { useAppSelector } from '@/store/store';

import {
  computeDates,
  selectDates,
} from '../../features/filtering/dates/dates.selectors';
import { QueryFilterState } from '../../features/filtering/filters/query-filters/query-filter.model';
import {
  selectEventsQfilter,
  selectHostIDQFilter,
  selectSignatureFilters,
} from '../../features/filtering/filters/query-filters/query-filters.selectors';
import { selectEventsTypesParams } from '../../features/filtering/filters/query-filters/query-filters.selectors';
import { selectTenant } from '../../features/user/tenancy/tenancy.selector';

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
  const datesFilter = useAppSelector(selectDates);
  const tenant = useAppSelector(selectTenant);
  const eventsTypes = useAppSelector(selectEventsTypesParams);
  const QFBuilder = useQFBuilder();
  const investigation = useAppSelector(selectInvestigationFilter);
  const qfilterExtension = useMemo(() => {
    const extension = [];
    if (investigation?.current.key && investigation?.current.value) {
      extension.push(
        QFBuilder.createFilter(
          investigation.current.key,
          investigation.current.value,
        ),
      );
    }
    if (investigation && investigation.stages.length > 0) {
      investigation.stages.forEach((stage) => {
        extension.push(
          QFBuilder.createFilter(
            'es_filter',
            stage.values
              .map((v) => `${stage.key}:"${esEscape(v)}"`)
              .join(' OR '),
          ),
        );
      });
    }
    if (options?.extendQfilter) {
      extension.push(...options.extendQfilter);
    }
    return extension;
  }, [investigation, QFBuilder, options]);
  const qfilter = useAppSelector(selectEventsQfilter(qfilterExtension));
  const host_id_qfilter = useAppSelector(
    selectHostIDQFilter(options?.extendQfilter),
  );
  const signatureFilters = useAppSelector(
    selectSignatureFilters(options?.extendQfilter),
  );

  const dates = computeDates(datesFilter);

  return {
    ...(subscribe?.includes('dates') && {
      start_date: dates.start_date,
      end_date: dates.end_date,
    }),
    ...(subscribe?.includes('qfilter') && {
      qfilter,
      ...eventsTypes,
    }),
    ...(subscribe?.includes('qfilterHost') && {
      host_id_qfilter,
    }),
    ...(subscribe?.includes('qfilterSignature') && signatureFilters),
    ...(subscribe?.includes('tenant') && { tenant }),
  };
};
