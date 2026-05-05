import { pipe } from 'ramda';
import { useMemo } from 'react';

import { useQueryFilters } from '@/features/query-filters';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';
import { QueryFilterState } from '@/features/query-filters/model/query-filter';

import { useTestActionsQuery } from '../../api/filter-actions.api';
import { FilterAction } from '../../model/filter-action.schema';

export const useInitialValues = (
  type: FilterAction['action'],
  filterAction?: FilterAction,
) => {
  const filters = useQueryFilters();
  const QFBuilder = useQFBuilder();
  const { data, isLoading } = useTestActionsQuery({
    action: type,
    fields:
      filterAction?.filter_defs.map((f) => f.key) ?? filters.map((f) => f.key),
  });
  return useMemo(
    () =>
      isLoading
        ? {
            filters: [],
            rulesets: filterAction?.rulesets ?? [],
            comment: filterAction?.comment ?? '',
          }
        : {
            filters: filterAction
              ? getFiltersFromFilterAction(filterAction.filter_defs, QFBuilder)
              : getInitialFilters(filters)
                  .filter((f) => data?.fields.includes(f.key))
                  .filter((f) =>
                    data?.operators.includes('different')
                      ? true
                      : !f.is_negated,
                  ),
            rulesets: filterAction?.rulesets ?? [],
            comment: filterAction?.comment ?? '',
          },
    [isLoading, filterAction, filters, data, QFBuilder],
  );
};

const sortBySuspended = (filters: QueryFilterState[]) => [
  ...filters.filter((f) => !f.is_suspended),
  ...filters.filter((f) => f.is_suspended),
];
const addEnabled = (filters: QueryFilterState[]) =>
  filters.map((f) => ({ ...f, enabled: f.is_suspended ? false : true }));

const getInitialFilters = pipe(sortBySuspended, addEnabled);

export const createFiltersFromFilterDefs = (
  filterDefs: FilterAction['filter_defs'],
  QFBuilder: ReturnType<typeof useQFBuilder>,
) =>
  filterDefs.map((f) => ({
    ...QFBuilder.createFilter(f.key, f.value, {
      is_negated: f.operator === 'different',
      is_wildcarded: !f.full_string,
    }),
  }));
const getFiltersFromFilterAction = pipe(
  createFiltersFromFilterDefs,
  addEnabled,
);
