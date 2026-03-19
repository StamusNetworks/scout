import {
  BookUp2,
  Code,
  Filter,
  FilterX,
  LucideIcon,
  PanelLeft,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSidebar } from '@/common/design-system/atoms/ui/sidebar';
import { getShortcutDisplay } from '@/common/lib/platform';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { getConfig } from '@/config';
import { useUpdatePushRulesetMutation } from '@/features/detection-methods/rulesets.api';
import { openDeclarationModal } from '@/features/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.slice';
import { openSuppressModal } from '@/features/filter-actions/components/filter-actions/create-edit-suppress-filter-action/create-edit-suppress.slice';
import { openTagModal } from '@/features/filter-actions/components/filter-actions/create-edit-tag-filter-action/create-edit-tag.slice';
import { openThresholdModal } from '@/features/filter-actions/components/filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.slice';
import { selectQueryFilters } from '@/features/filtering/filters/query-filters/query-filters.selectors';
import { useClearFilters } from '@/features/filtering/filters/query-filters/use-cases/clear-filters/clear-filters';
import {
  selectIsSidebarOpen,
  setIsSidebarOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { API } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/store';

export type GlobalCommandAction = {
  Icon?: LucideIcon;
  title: string;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
};

export type GlobalCommands = {
  title?: string;
  items: GlobalCommandAction[];
};

export const useGlobalCommands = (): GlobalCommands[] => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectQueryFilters);
  const { toggleSidebar: toggleNavSidebar } = useSidebar();
  const isSidebarOpen = useAppSelector(selectIsSidebarOpen);
  const { enterprise } = useFeatureFlags();
  const [updatePushRuleset] = useUpdatePushRulesetMutation();
  const clearFilters = useClearFilters();
  const handleUpdatePushRuleset = () => {
    updatePushRuleset({ enterprise })
      .unwrap()
      .then(() => window.open(getConfig()?.apiUrl + '/rules/status/', '_blank'))
      .catch(() => toast.error('Error updating rulesets'));
  };
  return [
    {
      items: [
        {
          Icon: RefreshCw,
          title: 'Reload data',
          action: () => {
            dispatch(API.util.resetApiState());
          },
        },
        {
          Icon: PanelLeft,
          title: 'Toggle Navigation',
          action: () => {
            toggleNavSidebar();
          },
          shortcut: getShortcutDisplay('B'),
        },
        {
          Icon: isSidebarOpen ? PanelRightClose : PanelRightOpen,
          title: isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar',
          action: () => {
            dispatch(setIsSidebarOpen(!isSidebarOpen));
          },
          shortcut: getShortcutDisplay('G'),
        },
      ],
    },
    {
      title: 'Filters',
      items: [
        {
          Icon: Filter,
          title: 'Add filter',
          shortcut: getShortcutDisplay('L'),
          action: () => {
            dispatch(setOpenModal('addFilterCommand'));
          },
        },
        {
          Icon: Code,
          title: 'Add Custom ES Filter',
          shortcut: getShortcutDisplay('O'),
          action: () => {
            dispatch(setOpenModal('addEsFilter'));
          },
        },
        {
          Icon: FilterX,
          title: 'Clear filters',
          action: () => {
            clearFilters();
          },
        },
        {
          Icon: Save,
          title: 'Save Filter Set',
          action: () => {
            dispatch(setOpenModal('saveFilterSet'));
          },
        },
      ],
    },
    {
      title: 'Filter Actions',
      items: [
        {
          title: 'Create Suppress filter action',
          action: () => {
            dispatch(openSuppressModal({ mode: 'create' }));
          },
          disabled: filters.length === 0,
        },
        {
          title: 'Create Threshold filter action',
          action: () => {
            dispatch(openThresholdModal({ mode: 'create' }));
          },
          disabled: filters.length === 0,
        },
        {
          title: 'Create Tag filter action',
          action: () => {
            dispatch(openTagModal({ mode: 'create', keep: false }));
          },
          disabled: filters.length === 0,
        },
        {
          title: 'Create Tag and Keep filter action',
          action: () => {
            dispatch(openTagModal({ mode: 'create', keep: true }));
          },
          disabled: filters.length === 0,
        },
        {
          title: 'Create declaration events',
          action: () => {
            dispatch(openDeclarationModal({ mode: 'create' }));
          },
          disabled: filters.length === 0,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          Icon: BookUp2,
          title: 'Update/Push Ruleset',
          action: handleUpdatePushRuleset,
        },
      ],
    },
  ];
};
