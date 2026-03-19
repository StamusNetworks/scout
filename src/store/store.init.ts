import { tablePreferencesInitialState } from '@/common/design-system/molecules/data-table/table-preferences.slice';
import { dashboardPageStateInitialState } from '@/features/events/detection-events/use-cases/explorer/store/dashboard.slice';
import { createEditDeclarationModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.slice';
import { createEditSuppressModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-suppress-filter-action/create-edit-suppress.slice';
import { createEditTagModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-tag-filter-action/create-edit-tag.slice';
import { createEditThresholdModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.slice';
import { datesFiltersInitialState } from '@/features/filtering/dates/dates.store';
import { queryFiltersInitialState } from '@/features/filtering/query-filters/store/query-filters.slice';
import { queryFiltersSetsInitialState } from '@/features/filtering/query-filters/store/query-filters-sets.slice';
import { addQfilterCommandInitialState } from '@/features/filtering/query-filters/use-cases/create-filter/add-qfilter-command.slice';
import { saveFilterSetModalInitialState } from '@/features/filtering/query-filters/use-cases/save-filter-set/save-filterset.slice';
import { investigationInitialState } from '@/features/investigation/investigation.slice';
import { investigationsHistoryInitialState } from '@/features/investigation/investigations-history.slice';
import { marketingStateInitialState } from '@/features/marketing/store/marketing.store';
import { helpInitialState } from '@/features/ui/help/help.slice';
import { preferencesInitialState } from '@/features/ui/preferences/preferences.slice';
import { uiStateInitialState } from '@/features/ui/ui-state.slice';
import { authInitialState } from '@/features/user/auth/store/auth.slice';
import { settingsInitialState } from '@/features/user/settings/settings.slice';
import { tenancyInitialState } from '@/features/user/tenancy/tenancy.slice';
import { userInitialState } from '@/features/user/user/user.slice';

import { RootState } from './store';

export const initialState: Omit<RootState, 'API'> = {
  auth: authInitialState,
  user: userInitialState,
  settings: settingsInitialState,
  filters: {
    queryFiltersSets: queryFiltersSetsInitialState,
    queryFilters: queryFiltersInitialState,
    datesFilters: datesFiltersInitialState,
    tenancy: tenancyInitialState,
  },
  pages: {
    explorer: dashboardPageStateInitialState,
  },
  tablePreferences: tablePreferencesInitialState,
  uiState: uiStateInitialState,
  preferences: preferencesInitialState,
  help: helpInitialState,
  investigation: {
    ongoing: investigationInitialState,
    history: investigationsHistoryInitialState,
  },
  modals: {
    addFiltersCommand: addQfilterCommandInitialState,
    saveFilterSetModal: saveFilterSetModalInitialState,
    createEditDeclarationModal: createEditDeclarationModalInitialState,
    createEditSuppressModal: createEditSuppressModalInitialState,
    createEditTagModal: createEditTagModalInitialState,
    createEditThresholdModal: createEditThresholdModalInitialState,
  },
  marketing: marketingStateInitialState,
};
