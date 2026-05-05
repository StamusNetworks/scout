import { tablePreferencesInitialState } from '@/common/design-system/molecules/data-table/table-preferences.slice';
import { authInitialState } from '@/features/auth/state/auth.slice';
import { datesFiltersInitialState } from '@/features/dates/state/dates.slice';
import { dashboardPageStateInitialState } from '@/features/events/detection-events/use-cases/explorer/store/dashboard.slice';
import { createEditDeclarationModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.slice';
import { createEditSendMailModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-send-mail-filter-action/create-edit-send-mail.slice';
import { createEditSuppressModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-suppress-filter-action/create-edit-suppress.slice';
import { createEditTagModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-tag-filter-action/create-edit-tag.slice';
import { createEditThresholdModalInitialState } from '@/features/filter-actions/components/filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.slice';
import { queryFiltersInitialState } from '@/features/filtering/filters/query-filters/query-filters.store';
import { addQfilterCommandInitialState } from '@/features/filtering/filters/query-filters/use-cases/create-filter/add-qfilter-command.slice';
import { queryFiltersSetsInitialState } from '@/features/filtering/filtersets/filtersets.store';
import { saveFilterSetModalInitialState } from '@/features/filtering/filtersets/use-cases/save-filter-set/save-filterset.slice';
import { investigationInitialState } from '@/features/investigation/investigation.slice';
import { investigationsHistoryInitialState } from '@/features/investigation/investigations-history.slice';
import { marketingStateInitialState } from '@/features/marketing/store/marketing.store';
import { settingsInitialState } from '@/features/settings/state/settings.slice';
import { tenancyInitialState } from '@/features/tenancy/state/tenancy.slice';
import { helpInitialState } from '@/features/ui/help/help.slice';
import { preferencesInitialState } from '@/features/ui/preferences/preferences.slice';
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
    createEditDeclarationModal: createEditDeclarationModalInitialState,
    createEditSendMailModal: createEditSendMailModalInitialState,
    createEditSuppressModal: createEditSuppressModalInitialState,
    createEditTagModal: createEditTagModalInitialState,
    createEditThresholdModal: createEditThresholdModalInitialState,
  },
  marketing: marketingStateInitialState,
};
