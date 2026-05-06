import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { createMigrate, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/es/storage';

import { tablePreferencesSlice } from '@/common/design-system/molecules/data-table/table-preferences.slice';
import { authSlice } from '@/features/auth/state/auth.slice';
import { datesFiltersSlice } from '@/features/dates/state/dates.slice';
import { dashboardPageStateSlice } from '@/features/events/state/dashboard.slice';
import { filterActionModalSlice } from '@/features/filter-actions/state/filter-action-modal.slice';
import { queryFiltersSetsSlice } from '@/features/filter-sets/state/filter-sets.slice';
import { saveFilterSetModalSlice } from '@/features/filter-sets/state/save-filter-set.slice';
import { helpSlice } from '@/features/help/state/help.slice';
import { investigationSlice } from '@/features/investigation/state/investigation.slice';
import { investigationsHistorySlice } from '@/features/investigation/state/investigations-history.slice';
import { marketingSlice } from '@/features/marketing/state/marketing.slice';
import { preferencesSlice } from '@/features/preferences/state/preferences.slice';
import { addQfilterCommandSlice } from '@/features/query-filters/state/add-qfilter-command.slice';
import { queryFiltersSlice } from '@/features/query-filters/state/query-filters.slice';
import { settingsSlice } from '@/features/settings/state/settings.slice';
import { tenancySlice } from '@/features/tenancy/state/tenancy.slice';
import { uiStateSlice } from '@/features/app-shell/state/ui-state.slice';

import { API } from './api';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Persisted state versions. Bump and add a migration when slice shapes change
// for keys in `whitelist`. Live state types are not coupled to these — these
// migrations work against the stored JSON shape at the time the version was cut.
const persistedStateMigrations = {
  // v1: queryFilters slice replaces flat `tagFilters` with nested `flags`.
  1: (state: any) => {
    const tagFilters = state?.filters?.queryFilters?.tagFilters;
    if (!tagFilters) return state;
    return {
      ...state,
      filters: {
        ...state.filters,
        queryFilters: {
          ...state.filters.queryFilters,
          flags: {
            eventTypes: {
              alert: tagFilters.alert ?? true,
              stamus: tagFilters.stamus ?? true,
              discovery: tagFilters.discovery ?? true,
            },
            alertTags: {
              relevant: tagFilters.relevant ?? true,
              informational: tagFilters.informational ?? true,
              untagged: tagFilters.untagged ?? true,
            },
            novelty: tagFilters.novelty ?? false,
          },
          tagFilters: undefined,
        },
      },
    };
  },
  // v2: QueryFilterState renames snake_case fields to camelCase.
  2: (state: any) => {
    const queryFilters: unknown = state?.filters?.queryFilters?.queryFilters;
    if (!Array.isArray(queryFilters)) return state;
    return {
      ...state,
      filters: {
        ...state.filters,
        queryFilters: {
          ...state.filters.queryFilters,
          queryFilters: queryFilters.map((f: any) => ({
            id: f.id,
            key: f.key,
            value: f.value,
            role: f.role,
            isSuspended: f.isSuspended ?? f.is_suspended ?? false,
            isNegated: f.isNegated ?? f.is_negated ?? false,
            isWildcarded: f.isWildcarded ?? f.is_wildcarded ?? false,
          })),
        },
      },
    };
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const persistConfig = {
  key: 'root',
  storage,
  version: 2,
  migrate: createMigrate(persistedStateMigrations),
  whitelist: ['filters', 'pages', 'preferences', 'help', 'investigation'],
  stateReconciler: autoMergeLevel2,
};

export const rootReducer = () =>
  combineReducers({
    auth: authSlice.reducer,
    settings: settingsSlice.reducer,
    filters: combineReducers({
      queryFilters: queryFiltersSlice.reducer,
      queryFiltersSets: queryFiltersSetsSlice.reducer,
      datesFilters: datesFiltersSlice.reducer,
      tenancy: tenancySlice.reducer,
    }),
    pages: combineReducers({
      explorer: dashboardPageStateSlice.reducer,
    }),
    tablePreferences: tablePreferencesSlice.reducer,
    marketing: marketingSlice.reducer,
    uiState: uiStateSlice.reducer,
    preferences: preferencesSlice.reducer,
    help: helpSlice.reducer,
    investigation: combineReducers({
      ongoing: investigationSlice.reducer,
      history: investigationsHistorySlice.reducer,
    }),
    modals: combineReducers({
      addFiltersCommand: addQfilterCommandSlice.reducer,
      saveFilterSetModal: saveFilterSetModalSlice.reducer,
      filterActionModal: filterActionModalSlice.reducer,
    }),
    [API.reducerPath]: API.reducer,
  });

export function setupStore(preloadedState?: Partial<RootStateWithAPI>) {
  const reducer = rootReducer();
  return configureStore({
    reducer: persistReducer<RootStateWithAPI>(persistConfig, reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(API.middleware),
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    preloadedState: preloadedState as any,
  });
}

export type RootState = Omit<ReturnType<ReturnType<typeof rootReducer>>, 'API'>;
export type RootStateWithAPI = ReturnType<ReturnType<typeof rootReducer>>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
