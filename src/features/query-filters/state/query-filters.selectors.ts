import { createSelector } from '@reduxjs/toolkit';

import { selectIsEnterprise } from '@/features/settings/state/settings.selectors';
import { RootState } from '@/store/store';

import { QFBuilder } from '../builders/qf-builder';
import { FilterCategory } from '../definitions/query-filter.config';
import {
  CEQueryFilters,
  CEQueryFiltersRecord,
  QueryFilters,
  QueryFiltersRecord,
} from '../definitions/query-filter.definitions';
import {
  AlertTagFlags,
  EventTypeFlags,
  FilterFlags,
} from '../model/filter-flags';
import { QueryFilterDefinition, QueryFilterType } from '../model/query-filter';

// Plain state-read selectors. Composition with investigation,
// enterprise gating, and qfilter building lives in hook-layer
// use-cases (see use-cases/build-*).

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

// Enterprise-gated views — return `null` outside of Enterprise mode so
// callers know the flag isn't applicable.

export const selectGatedFilterFlags = createSelector(
  [selectFilterFlags, selectIsEnterprise],
  (flags, isEnterprise): FilterFlags | null => (isEnterprise ? flags : null),
);

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
