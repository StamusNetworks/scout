import { tablePreferencesInitialState } from '@/common/design-system/molecules/data-table/table-preferences.slice';
import { authInitialState } from '@/features/auth/state/auth.slice';
import { datesFiltersInitialState } from '@/features/dates/state/dates.slice';
import { dashboardPageStateInitialState } from '@/features/events/state/dashboard.slice';
import { filterActionModalInitialState } from '@/features/filter-actions/state/filter-action-modal.slice';
import { queryFiltersSetsInitialState } from '@/features/filter-sets/state/filter-sets.slice';
import { saveFilterSetModalInitialState } from '@/features/filter-sets/state/save-filter-set.slice';
import { helpInitialState } from '@/features/help/state/help.slice';
import { investigationInitialState } from '@/features/investigation/state/investigation.slice';
import { investigationsHistoryInitialState } from '@/features/investigation/state/investigations-history.slice';
import { marketingInitialState } from '@/features/marketing/state/marketing.slice';
import { preferencesInitialState } from '@/features/preferences/state/preferences.slice';
import { addQfilterCommandInitialState } from '@/features/query-filters/state/add-qfilter-command.slice';
import { queryFiltersInitialState } from '@/features/query-filters/state/query-filters.slice';
import { settingsInitialState } from '@/features/settings/state/settings.slice';
import { tenancyInitialState } from '@/features/tenancy/state/tenancy.slice';
import { uiStateInitialState } from '@/features/ui/ui-state.slice';

import { RootState } from './store';

export const initialState: Omit<RootState, 'API'> = {
  auth: authInitialState,
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
    filterActionModal: filterActionModalInitialState,
  },
  marketing: marketingInitialState,
};
