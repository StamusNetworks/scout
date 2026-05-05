import { createSelector } from '@reduxjs/toolkit';

import { selectInvestigationFilter } from '@/features/investigation/investigation.slice';
import { selectIsEnterprise } from '@/features/settings/state/settings.selectors';
import { RootState } from '@/store/store';

import { FilterCategory } from './constants/query-filter.config';
import {
  CEQueryFilters,
  CEQueryFiltersRecord,
  getFilterDef,
  QueryFilters,
  QueryFiltersRecord,
} from './constants/query-filter.definition';
import {
  AlertTagFlags,
  EventTypeFlags,
  FilterFlags,
} from './filter-flags.model';
import {
  QueryFilterDefinition,
  QueryFilterState,
  QueryFilterType,
} from './query-filter.model';
import { buildSignatureFilters } from './use-cases/build-signature-filter/build-signature-filter';
import { QFBuilder } from './utils/qf-builder';

export const selectQueryFilters = (state: RootState) =>
  state.filters.queryFilters.queryFilters;

export const selectFilterFlags = (state: RootState) =>
  state.filters.queryFilters.flags;

export const selectEventTypeFlags = (state: RootState) =>
  state.filters.queryFilters.flags.eventTypes;

export const selectAlertTagFlags = (state: RootState) =>
  state.filters.queryFilters.flags.alertTags;

export const selectNovelty = (state: RootState) =>
  state.filters.queryFilters.flags.novelty;

export const selectHostIDQFilter = (
  extraQFilter: QueryFilterState[] = [],
  blacklist: string[] = [],
) =>
  createSelector(
    [selectInvestigationFilter, selectQueryFilters, selectQfilterBuilder],
    (investigation, queryFilters, QFBuilder) => {
      const filters = [...queryFilters, ...extraQFilter];
      if (investigation?.current.key && investigation?.current.value) {
        filters.push(
          QFBuilder.createFilter(
            investigation?.current.key,
            investigation?.current.value,
          ),
        );
      }
      return QFBuilder.toHostIdQFString(
        filters.filter((f) => !blacklist.includes(f.key)),
      );
    },
  );

export const selectSignatureFilters = (extraQFilter: QueryFilterState[] = []) =>
  createSelector([selectQueryFilters], (queryFilters) => {
    const filters = [...queryFilters, ...extraQFilter];
    return buildSignatureFilters(filters);
  });

export const selectEventTypeFlagsParams = createSelector(
  [selectEventTypeFlags, selectIsEnterprise],
  (eventTypes, isEnterprise): EventTypeFlags | null =>
    isEnterprise ? eventTypes : null,
);

export const selectAlertTagFlagsParams = createSelector(
  [selectAlertTagFlags, selectIsEnterprise],
  (alertTags, isEnterprise): AlertTagFlags | null =>
    isEnterprise ? alertTags : null,
);

export const selectGatedFilterFlags = createSelector(
  [selectFilterFlags, selectIsEnterprise],
  (flags, isEnterprise): FilterFlags | null => (isEnterprise ? flags : null),
);

export type FilterMapping = { type: string; category: FilterCategory };
export type MixedQueryFilterDefinitions = Record<
  string,
  | { type: QueryFilterType; category: FilterCategory }
  | ({ type: QueryFilterType } & QueryFilterDefinition)
>;

export const selectQueryFiltersDefinitions = createSelector(
  [(state: RootState) => state.filters.queryFilters.types, selectIsEnterprise],
  (filterTypes, isEnterprise) => {
    if (!filterTypes)
      return isEnterprise ? QueryFiltersRecord : CEQueryFiltersRecord;
    const filters = isEnterprise ? QueryFilters : CEQueryFilters;
    return filters.reduce(
      (acc, curr) => {
        acc[curr.key] = {
          ...acc[curr.key],
          ...curr,
        };
        return acc;
      },
      { ...filterTypes } as MixedQueryFilterDefinitions,
    );
  },
);

export const selectQueryFilterDefinition = (filterId: string) =>
  createSelector(
    [(state: RootState) => state.filters.queryFilters.types],
    (filterTypes) => {
      if (!filterTypes) return QueryFiltersRecord[filterId];
      return {
        ...filterTypes[filterId],
        ...QueryFiltersRecord[filterId],
      };
    },
  );

export const selectQfilterBuilder = createSelector(
  [(state: RootState) => state.filters.queryFilters.types],
  (types) => {
    if (!types) return QFBuilder(QueryFiltersRecord, 'raw');
    const combinedTypes = QueryFilters.reduce(
      (acc, curr) => {
        acc[curr.key] = {
          ...curr,
          ...types[curr.key],
        };
        return acc;
      },
      { ...types },
    );
    return QFBuilder(combinedTypes, 'raw');
  },
);

export const selectEventsQfilter = (
  filterExtension: QueryFilterState[] | string = [],
  options: Partial<{
    tags: boolean;
  }> = {
    tags: true,
  },
) =>
  createSelector(
    [
      (state: RootState) => state.filters.queryFilters.queryFilters,
      selectGatedFilterFlags,
      selectQfilterBuilder,
    ],
    (queryFilters, flags, Builder) => {
      const novelty = options?.tags ? flags?.novelty : false;
      if (typeof filterExtension === 'string') {
        const filterString = Builder?.toQFString(
          queryFilters
            .filter(
              (f) =>
                getFilterDef(f.key)?.category === FilterCategory.EVENT ||
                (getFilterDef(f.key) === undefined &&
                  !f.key.startsWith('host_id.')),
            )
            .filter((f) => f.is_suspended !== true),
          options.tags ? flags?.alertTags : undefined,
          novelty,
        );
        return `${filterString ? filterString + ' AND ' : ''} ${filterExtension}`;
      }
      return Builder?.toQFString(
        [
          ...queryFilters
            .filter(
              (f) =>
                getFilterDef(f.key)?.category === FilterCategory.EVENT ||
                (getFilterDef(f.key) === undefined &&
                  !f.key.startsWith('host_id.')),
            )
            .filter((f) => f.is_suspended !== true),
          ...filterExtension.filter(
            (f) =>
              getFilterDef(f.key)?.category === FilterCategory.EVENT ||
              (getFilterDef(f.key) === undefined &&
                !f.key.startsWith('host_id.')),
          ),
        ],
        options.tags ? flags?.alertTags : undefined,
        novelty,
      );
    },
  );
