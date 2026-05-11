import { useMemo } from 'react';

import { useInvestigationFilter } from '@/features/investigation';

import { useQFBuilder } from '../hooks/use-qf-builder';
import { QueryFilterState } from '../model/query-filter';
import { useQueryFilters } from './use-query-filters';

export function useBuildHostIdQfilter(
  extra?: QueryFilterState[],
  blacklist?: string[],
): string | undefined {
  const queryFilters = useQueryFilters();
  const qfBuilder = useQFBuilder();
  const investigation = useInvestigationFilter();

  return useMemo(() => {
    const filters = [...queryFilters, ...(extra || [])];
    if (investigation?.current.key && investigation?.current.value) {
      filters.push(
        qfBuilder.createFilter(
          investigation.current.key,
          investigation.current.value,
        ),
      );
    }
    const filtered = blacklist
      ? filters.filter((f) => !blacklist.includes(f.key))
      : filters;
    return qfBuilder.toHostIdQFString(filtered);
  }, [queryFilters, qfBuilder, investigation, extra, blacklist]);
}
