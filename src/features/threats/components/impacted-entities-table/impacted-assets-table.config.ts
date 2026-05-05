import { Filter } from '@/common/design-system/molecules/data-table/filters/filters.types';

export const filters: Filter[] = [
  {
    type: 'text',
    id: 'search',
    placeholder: 'Search by value',
  },
  {
    type: 'command-single',
    id: 'kill_chain',
    title: 'Kill Chain',
    options: [
      {
        label: 'Reconnaissance',
        value: 'reconnaissance',
      },
      {
        label: 'Weaponization',
        value: 'weaponization',
      },
      {
        label: 'Delivery',
        value: 'delivery',
      },
      {
        label: 'Exploitation',
        value: 'exploitation',
      },
      {
        label: 'Installation',
        value: 'installation',
      },
      {
        label: 'Command and Control',
        value: 'command_and_control',
      },
      {
        label: 'Actions on Objectives',
        value: 'actions_on_objectives',
      },
      {
        label: 'Pre-Condition',
        value: 'pre_condition',
      },
    ],
  },
  {
    type: 'pills',
    id: 'status',
    options: [
      {
        label: 'New',
        value: 'new',
      },
      {
        label: 'All',
        value: '',
      },
      {
        label: 'Fixed',
        value: 'fixed',
      },
    ],
    defaultValue: '',
  },
];
