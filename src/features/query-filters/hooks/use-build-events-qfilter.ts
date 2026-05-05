import { useMemo } from 'react';

import { esEscape } from '@/common/lib/strings';
import { selectInvestigationFilter } from '@/features/investigation/investigation.slice';
import { useIsEnterprise } from '@/features/settings';
import { useAppSelector } from '@/store/store';

import {
  FilterCategory,
  HOST_ID_KEY_PREFIX,
} from '../definitions/query-filter.config';
import { getFilterDef } from '../definitions/query-filter.definitions';
import { useQFBuilder } from '../hooks/use-qf-builder';
import { useTagFiltersRepository } from '../hooks/use-tag-filters';
import { QueryFilterState } from '../model/query-filter';
import { useQueryFiltersRepository } from '../state/query-filters.repository';

export function useBuildEventsQfilter(
  filterExtension: QueryFilterState[] | string = [],
  options: Partial<{ tags: boolean }> = { tags: true },
): string | undefined {
  const repo = useQueryFiltersRepository();
  const tagRepo = useTagFiltersRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useAppSelector(selectInvestigationFilter);
  const isEnterprise = useIsEnterprise();

  return useMemo(() => {
    const queryFilters = repo.getAll();
    const flags = isEnterprise ? tagRepo.getAll() : null;
    const alertTags = flags?.alertTags;
    const novelty = options?.tags ? flags?.novelty : false;

    const eventFilter = (f: QueryFilterState) =>
      getFilterDef(f.key)?.category === FilterCategory.EVENT ||
      (getFilterDef(f.key) === undefined &&
        !f.key.startsWith(HOST_ID_KEY_PREFIX));

    if (typeof filterExtension === 'string') {
      const activeFilters = queryFilters
        .filter(eventFilter)
        .filter((f) => !f.is_suspended);
      const filterString = qfBuilder.toQFString(
        activeFilters,
        options.tags ? alertTags : undefined,
        novelty,
      );
      return `${filterString ? filterString + ' AND ' : ''} ${filterExtension}`;
    }

    // Build investigation extension
    const extension: QueryFilterState[] = [];
    if (investigation?.current.key && investigation?.current.value) {
      extension.push(
        qfBuilder.createFilter(
          investigation.current.key,
          investigation.current.value,
        ),
      );
    }
    if (investigation && investigation.stages.length > 0) {
      investigation.stages.forEach((stage) => {
        extension.push(
          qfBuilder.createFilter(
            'es_filter',
            stage.values
              .map((v) => `${stage.key}:"${esEscape(v)}"`)
              .join(' OR '),
          ),
        );
      });
    }

    const allExtension = [...extension, ...filterExtension];
    return qfBuilder.toQFString(
      [
        ...queryFilters.filter(eventFilter).filter((f) => !f.is_suspended),
        ...allExtension.filter(eventFilter),
      ],
      options.tags ? alertTags : undefined,
      novelty,
    );
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
