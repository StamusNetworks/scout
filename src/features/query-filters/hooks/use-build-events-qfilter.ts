import { useMemo } from 'react';

import { useInvestigationFilter } from '@/features/investigation';
import { useIsEnterprise } from '@/features/settings';

import { buildEventsQfilter } from '../builders/build-events-qfilter';
import { QueryFilterState } from '../model/query-filter';
import { useFilterFlagsRepository } from './use-filter-flags-repository';
import { useQFBuilder } from './use-qf-builder';
import { useQueryFilters } from './use-query-filters';

export function useBuildEventsQfilter(
  filterExtension: QueryFilterState[] | string = [],
  options: Partial<{ tags: boolean }> = { tags: true },
): string | undefined {
  const queryFilters = useQueryFilters();
  const tagRepo = useFilterFlagsRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useInvestigationFilter();
  const isEnterprise = useIsEnterprise();

  return useMemo(() => {
    const flags = isEnterprise ? tagRepo.getAll() : null;
    return buildEventsQfilter({
      queryFilters,
      alertTags: options.tags ? (flags?.alertTags ?? undefined) : undefined,
      novelty: options.tags ? (flags?.novelty ?? false) : false,
      investigation,
      filterExtension,
      qfBuilder,
    });
  }, [
    queryFilters,
    tagRepo,
    qfBuilder,
    investigation,
    filterExtension,
    options,
    isEnterprise,
  ]);
}
