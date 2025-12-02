import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { toPairs } from 'ramda';
import { toast } from 'sonner';

import { capitalizeAll, startsWithOneOf } from '@/common/lib/strings';
import { SettingsAPI } from '@/features/user/settings/settings.api';

import {
  getFilterDef,
  QueryFilters,
  QueryFiltersRecord,
} from '../constants/query-filter.definition';
import { QueryFilterState, QueryFilterType } from '../model/query-filter';
import { FilterInput } from '../utils/filter-mapper';
import { QFBuilder } from '../utils/qf-builder';

const blacklisted = ['agent', 'beaconing_statistics'];

export type EventTypes = {
  discovery: boolean;
  stamus: boolean;
  alert: boolean;
};
export type AlertTags = {
  relevant: boolean;
  untagged: boolean;
  informational: boolean;
};
export type Novelty = {
  novelty: boolean;
};
export type TagFilters = EventTypes & AlertTags & Novelty;

type QueryFiltersSliceState = {
  queryFilters: QueryFilterState[];
  tagFilters: TagFilters;
  types: Record<string, { type: QueryFilterType }> | undefined;
};

const initialState: QueryFiltersSliceState = {
  queryFilters: [],
  tagFilters: {
    novelty: false,
    informational: true,
    relevant: true,
    untagged: true,
    stamus: true,
    alert: true,
    discovery: true,
  },
  types: undefined,
};

const authorizeMultipleFilters: (keyof typeof QueryFiltersRecord)[] = [
  'msg',
  'es_filter',
];

export const queryFiltersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    addQueryFilter: (state, action: PayloadAction<FilterInput>) => {
      const filterDef = getFilterDef(action.payload.key);
      const label = filterDef?.label ?? capitalizeAll(action.payload.key);
      const QFBuilder = selectQfilterBuilder(state);
      const newFilter = QFBuilder.createFilter(
        action.payload.key,
        action.payload.value,
        action.payload.options,
      );

      const siblings = state.queryFilters.filter(
        (f) => f.key === action.payload.key,
      );
      if (
        !newFilter.is_negated &&
        siblings?.length > 0 &&
        !authorizeMultipleFilters.includes(action.payload.key)
      ) {
        if (!newFilter.is_wildcarded) {
          siblings
            .filter((f) => !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        }
        if (
          newFilter.is_wildcarded &&
          state.types?.[newFilter.key].type === 'text'
        ) {
          siblings
            .filter((f) => !f.is_wildcarded && !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        } else {
          siblings
            .filter((f) => !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        }
      }

      const copyIndex = state.queryFilters.findIndex(
        (f) => f.key === action.payload.key && f.value === action.payload.value,
      );
      if (copyIndex >= 0) {
        state.queryFilters[copyIndex] = newFilter;
        toast.success(`${label} filter updated`, {
          description: `value: ${action.payload.value}`,
        });
        return;
      }

      toast.success(`${label} filter added`, {
        description: `value: ${action.payload.value}`,
      });
      state.queryFilters.push(newFilter);
    },
    updateQueryFilter: (state, action: PayloadAction<QueryFilterState>) => {
      const index = state.queryFilters.findIndex(
        (f) => f.id === action.payload.id,
      );
      if (index === -1) {
        console.log("Filter doesn't exist");
        return;
      }
      const payload = action.payload;
      const filter = state.queryFilters[index];
      const siblings = state.queryFilters.filter(
        (f) => f.key === filter.key && f.id !== filter.id,
      );

      if (
        !payload.is_negated &&
        siblings?.length > 0 &&
        !authorizeMultipleFilters.includes(action.payload.key)
      ) {
        if (!payload.is_wildcarded) {
          siblings
            .filter((f) => !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        }
        if (
          payload.is_wildcarded &&
          state.types?.[payload.key].type === 'text'
        ) {
          siblings
            .filter((f) => !f.is_wildcarded && !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        } else {
          siblings
            .filter((f) => !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        }
      }

      // Update the filter
      state.queryFilters[index] = { ...filter, ...action.payload };

      // Show the success toast
      const filterDef = getFilterDef(filter!.key);
      const label =
        filterDef?.label ?? capitalizeAll(filter.key.replaceAll('.', ' '));
      toast.success(`${label} filter updated`, {
        description: action.payload.value
          ? `Value: ${action.payload.value}`
          : action.payload.key
            ? `Converted to: ${getFilterDef(action.payload.key)?.label || capitalizeAll(action.payload.key.replaceAll('.', ' '))}`
            : undefined,
      });
    },
    deleteQueryFilter: (state, action: PayloadAction<string>) => {
      const index = state.queryFilters.findIndex(
        (f) => f.id === action.payload,
      );
      const filter = state.queryFilters[index];
      const filterDef = getFilterDef(filter.key);
      const label =
        filterDef?.label ?? capitalizeAll(filter.key.replaceAll('.', ' '));
      if (index === -1) {
        console.log("Filter doesn't exist");
        return;
      }
      state.queryFilters.splice(index, 1);

      toast.success(`${label} filter deleted`, {
        description: `value: ${filter.value}`,
      });
    },
    clearQueryFilters: (state) => {
      state.queryFilters.length = 0;
      toast.success(`Cleared all filters`);
    },
    clearSuspendedFilters: (state) => {
      state.queryFilters.splice(
        0,
        state.queryFilters.length,
        ...state.queryFilters.filter((filter) => !filter.is_suspended),
      );
      toast.success('Cleared suspended filters');
    },
    suspendQueryFilter: (state, action: PayloadAction<string>) => {
      const index = state.queryFilters.findIndex(
        (f) => f.id === action.payload,
      );
      const filter = state.queryFilters[index];
      if (index === -1) {
        console.log("Filter doesn't exist");
        return;
      }

      const siblings = state.queryFilters.filter(
        (f) => f.key === filter.key && f.id !== filter.id,
      );

      if (
        !filter.is_negated &&
        siblings?.length > 0 &&
        !authorizeMultipleFilters.includes(filter.key)
      ) {
        if (!filter.is_wildcarded) {
          siblings
            .filter((f) => !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        }
        if (filter.is_wildcarded && state.types?.[filter.key].type === 'text') {
          siblings
            .filter((f) => !f.is_wildcarded && !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        } else {
          siblings
            .filter((f) => !f.is_negated)
            .forEach((sibling) => {
              sibling.is_suspended = true;
            });
        }
      }

      state.queryFilters[index].is_suspended =
        !state.queryFilters[index].is_suspended;
    },
    reorderQueryFilters: (state, action: PayloadAction<QueryFilterState[]>) => {
      state.queryFilters.splice(
        0,
        state.queryFilters.length,
        ...action.payload,
      );
    },
    // negateFilter: (state, action: PayloadAction<string>) => {
    //   const index = state.queryFilters.findIndex((f) => f.key === action.payload);
    //   if (index === -1) {
    //     console.log("Filter doesn't exist");
    //     return;
    //   }
    //   state.queryFilters[index].negated = !state.queryFilters[index].negated;
    // },
    replaceFilters: (
      state,
      action: PayloadAction<FilterInput[] | QueryFilterState[]>,
    ) => {
      const QFBuilder = selectQfilterBuilder(state);
      state.queryFilters.forEach((filter) => (filter.is_suspended = true));
      action.payload.forEach((newFilter) => {
        // Check if this is a QueryFilterState (has id property) or FilterInput
        const isQueryFilterState = 'id' in newFilter;

        const isNegated = isQueryFilterState
          ? newFilter.is_negated
          : !!newFilter.options?.is_negated;
        const isWildcarded = isQueryFilterState
          ? newFilter.is_wildcarded
          : !!newFilter.options?.is_wildcarded;

        const copyIndex = state.queryFilters.findIndex(
          (f) =>
            f.key === newFilter.key &&
            f.value === newFilter.value &&
            f.is_negated === isNegated &&
            f.is_wildcarded === isWildcarded,
        );
        if (copyIndex >= 0) {
          state.queryFilters[copyIndex].is_suspended = false;
        } else {
          if (isQueryFilterState) {
            // For QueryFilterState, we can push it directly since it already has all required properties
            state.queryFilters.push(newFilter);
          } else {
            // For FilterInput, we need to create a new filter using QFBuilder
            state.queryFilters.push(
              QFBuilder.createFilter(
                newFilter.key,
                newFilter.value,
                newFilter.options,
              ),
            );
          }
        }
      });
    },
    updateTagFilters: (state, action: PayloadAction<Partial<TagFilters>>) => {
      state.tagFilters = {
        ...state.tagFilters,
        ...action.payload,
      };
    },
    suspendQueryFilters: (
      state,
      action: PayloadAction<{ fn: (filter: QueryFilterState) => true | false }>,
    ) => {
      state.queryFilters.forEach((filter) => {
        if (action.payload.fn(filter)) {
          filter.is_suspended = true;
        }
      });
    },
    updateOrCreateByRole: (state, action: PayloadAction<FilterInput>) => {
      const filter = action.payload;
      const QFBuilder = selectQfilterBuilder(state);
      const existing = state.queryFilters.find(
        (f) => f.role === filter.options?.role,
      );

      const { id, ...newFilter } = QFBuilder.createFilter(
        filter.key,
        filter.value,
        filter.options,
      );

      if (!existing) {
        state.queryFilters.push({ id, ...newFilter });
      } else {
        Object.assign(existing, newFilter);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      SettingsAPI.endpoints.getESMapping.matchFulfilled,
      (state, action) => {
        state.types = toPairs(action.payload).reduce(
          (acc, [key, value]) => {
            if (startsWithOneOf(key, blacklisted)) {
              return acc;
            }
            acc[key] = value;
            return acc;
          },
          {} as Record<string, { type: QueryFilterType }>,
        );
      },
    );
  },
});

export const {
  addQueryFilter,
  deleteQueryFilter,
  clearQueryFilters,
  clearSuspendedFilters,
  suspendQueryFilter,
  updateQueryFilter,
  reorderQueryFilters,
  replaceFilters,
  updateTagFilters,
  suspendQueryFilters,
  updateOrCreateByRole,
} = queryFiltersSlice.actions;
export const queryFiltersInitialState = initialState;

export const selectQfilterBuilder = createSelector(
  [(state: QueryFiltersSliceState) => state.types],
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
