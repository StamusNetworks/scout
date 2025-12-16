import { createSelector } from '@reduxjs/toolkit';

import { selectIsEnterprise } from '@/common/lib/use-feature-flags';
import { selectInvestigationFilter } from '@/features/hunt/investigation/investigation.slice';
import { RootState } from '@/store/store';

import { FilterCategory } from '../constants/query-filter.config';
import {
  getFilterDef,
  QueryFilters,
  QueryFiltersRecord,
} from '../constants/query-filter.definition';
import {
  QueryFilterDefinition,
  QueryFilterState,
  QueryFilterType,
} from '../model/query-filter';
import { buildHostIdQFilter } from '../utils/build-hostid-qfilter';
import { buildSignatureFilters } from '../utils/build-signature-filters';
import { QFBuilder } from '../utils/qf-builder';
import { AlertTags, EventTypes, TagFilters } from './query-filters.slice';

export const selectQueryFilters = (state: RootState) =>
  state.filters.queryFilters.queryFilters;

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
      return buildHostIdQFilter(
        filters.filter((f) => !blacklist.includes(f.key)),
      );
    },
  );

export const selectSignatureFilters = (extraQFilter: QueryFilterState[] = []) =>
  createSelector([selectQueryFilters], (queryFilters) => {
    const filters = [...queryFilters, ...extraQFilter];
    return buildSignatureFilters(filters);
  });

const selectAlert = (state: RootState) =>
  state.filters.queryFilters.tagFilters.alert;
const selectDiscovery = (state: RootState) =>
  state.filters.queryFilters.tagFilters.discovery;
const selectStamus = (state: RootState) =>
  state.filters.queryFilters.tagFilters.stamus;
const selectInformational = (state: RootState) =>
  state.filters.queryFilters.tagFilters.informational;
const selectRelevant = (state: RootState) =>
  state.filters.queryFilters.tagFilters.relevant;
const selectUntagged = (state: RootState) =>
  state.filters.queryFilters.tagFilters.untagged;
export const selectNovelty = (state: RootState) =>
  state.filters.queryFilters.tagFilters.novelty;

export const selectAlertTagsFiltersParams = createSelector(
  [selectRelevant, selectUntagged, selectInformational, selectNovelty],
  (relevant, untagged, informational): AlertTags => ({
    relevant,
    untagged,
    informational,
  }),
);

export const selectEventsTypesParams = createSelector(
  [selectDiscovery, selectStamus, selectAlert, selectIsEnterprise],
  (discovery, stamus, alert, isEnterprise): EventTypes | null =>
    isEnterprise
      ? {
          discovery,
          stamus,
          alert,
        }
      : null,
);

export const selectTagFilters = createSelector(
  [
    selectAlert,
    selectDiscovery,
    selectStamus,
    selectInformational,
    selectRelevant,
    selectUntagged,
    selectNovelty,
    selectIsEnterprise,
  ],
  (
    alert,
    discovery,
    stamus,
    informational,
    relevant,
    untagged,
    novelty,
    isEnterprise,
  ): TagFilters | null =>
    isEnterprise
      ? {
          alert,
          discovery,
          stamus,
          informational,
          relevant,
          untagged,
          novelty,
        }
      : null,
);

export type FilterMapping = { type: string; category: FilterCategory };
export type MixedQueryFilterDefinitions = Record<
  string,
  | { type: QueryFilterType; category: FilterCategory }
  | ({ type: QueryFilterType } & QueryFilterDefinition)
>;

export const selectQueryFiltersDefinitions = createSelector(
  [(state: RootState) => state.filters.queryFilters.types],
  (filterTypes) => {
    if (!filterTypes) return QueryFiltersRecord;
    return QueryFilters.reduce(
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
      selectTagFilters,
      selectQfilterBuilder,
    ],
    (queryFilters, tags, Builder) => {
      const novelty = options?.tags ? tags?.novelty : false;
      if (typeof filterExtension === 'string') {
        const filterString = Builder?.toQFString(
          [
            ...queryFilters
              .filter(
                (f) =>
                  getFilterDef(f.key)?.category === FilterCategory.EVENT ||
                  (getFilterDef(f.key) === undefined &&
                    !f.key.startsWith('host_id.')),
              )
              .filter((f) => f.is_suspended !== true),
          ],
          options.tags ? tags : undefined,
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
        tags,
        novelty,
      );
    },
  );
