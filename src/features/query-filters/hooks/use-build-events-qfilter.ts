import { useMemo } from 'react';

import { useInvestigationFilter } from '@/features/investigation';
import { useIsEnterprise } from '@/features/settings';

import { buildEventsQfilter } from '../builders/build-events-qfilter';
import { QueryFilterState } from '../model/query-filter';
import { useQueryFiltersRepository } from '../state/query-filters.repository';
import { useFilterFlagsRepository } from './use-filter-flags-repository';
import { useQFBuilder } from './use-qf-builder';

export function useBuildEventsQfilter(
  filterExtension: QueryFilterState[] | string = [],
  options: Partial<{ tags: boolean }> = { tags: true },
): string | undefined {
  const repo = useQueryFiltersRepository();
  const tagRepo = useFilterFlagsRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useInvestigationFilter();
  const isEnterprise = useIsEnterprise();

  return useMemo(() => {
    const flags = isEnterprise ? tagRepo.getAll() : null;
    return buildEventsQfilter({
      queryFilters: repo.getAll(),
      alertTags: options.tags ? (flags?.alertTags ?? undefined) : undefined,
      novelty: options.tags ? (flags?.novelty ?? false) : false,
      investigation,
      filterExtension,
      qfBuilder,
    });
  }, [
    repo,
    tagRepo,
    qfBuilder,
    investigation,
    filterExtension,
    options,
    isEnterprise,
  ]);
}
