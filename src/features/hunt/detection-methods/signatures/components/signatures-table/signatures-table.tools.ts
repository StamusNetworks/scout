import { Filter } from '@/common/design-system/molecules/data-table/filters/filters.types';

export const signaturesTableTools: Filter[] = [
  {
    type: 'checkbox',
    id: 'hits_min',
    title: 'Show only with alerts',
    enabledValue: '1',
    disabledValue: '0',
    defaultValue: '1',
  },
];
