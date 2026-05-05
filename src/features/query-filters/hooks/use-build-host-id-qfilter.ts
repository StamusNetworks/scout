import { useMemo } from 'react';

import { selectInvestigationFilter } from '@/features/investigation/investigation.slice';
import { useAppSelector } from '@/store/store';

import { useQFBuilder } from '../hooks/use-qf-builder';
import { QueryFilterState } from '../model/query-filter';
import { useQueryFiltersRepository } from '../state/query-filters.repository';

export function useBuildHostIdQfilter(
  extra?: QueryFilterState[],
  blacklist?: string[],
): string | undefined {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useAppSelector(selectInvestigationFilter);

  return useMemo(() => {
    const queryFilters = repo.getAll();
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
  }, [repo, qfBuilder, investigation, extra, blacklist]);
}
