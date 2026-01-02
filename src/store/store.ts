import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';

import { dashboardPageStateSlice } from '@/features/hunt/dashboard/store/dashboard.slice';
import { createEditDeclarationModalSlice } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.slice';
import { createEditSuppressModalSlice } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-suppress-filter-action/create-edit-suppress.slice';
import { createEditTagModalSlice } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-tag-filter-action/create-edit-tag.slice';
import { createEditThresholdModalSlice } from '@/features/hunt/filter-actions/components/filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.slice';
import { datesFiltersSlice } from '@/features/hunt/filtering/dates-filters/dates-filters.slice';
import { addQfilterCommandSlice } from '@/features/hunt/filtering/query-filters/components/add-qfilter-command/add-qfilter-command.slice';
import { saveFilterSetModalSlice } from '@/features/hunt/filtering/query-filters/components/save-filterset/save-filterset.slice';
import { queryFiltersSlice } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { queryFiltersSetsSlice } from '@/features/hunt/filtering/query-filters/store/query-filters-sets.slice';
import { investigationSlice } from '@/features/hunt/investigation/investigation.slice';
import { investigationsHistorySlice } from '@/features/hunt/investigation/investigations-history.slice';
import { marketingStateSlice } from '@/features/marketing/store/marketing.store';
import { helpSlice } from '@/features/ui/help/help.slice';
import { preferencesSlice } from '@/features/ui/preferences/preferences.slice';
import { uiStateSlice } from '@/features/ui/ui-state.slice';
import { authSlice } from '@/features/user/auth/store/auth.slice';
import { settingsSlice } from '@/features/user/settings/settings.slice';
import { tenancySlice } from '@/features/user/tenancy/tenancy.slice';
import { userSlice } from '@/features/user/user/user.slice';

import { API } from './api';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['filters', 'pages', 'preferences', 'help', 'investigation'],
  stateReconciler: autoMergeLevel2,
};

export const rootReducer = () =>
  combineReducers({
    auth: authSlice.reducer,
    user: userSlice.reducer,
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
    marketing: marketingStateSlice.reducer,
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
      createEditDeclarationModal: createEditDeclarationModalSlice.reducer,
      createEditSuppressModal: createEditSuppressModalSlice.reducer,
      createEditTagModal: createEditTagModalSlice.reducer,
      createEditThresholdModal: createEditThresholdModalSlice.reducer,
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

// export const store = setupStore();

export type RootState = Omit<ReturnType<ReturnType<typeof rootReducer>>, 'API'>;
export type RootStateWithAPI = ReturnType<ReturnType<typeof rootReducer>>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
