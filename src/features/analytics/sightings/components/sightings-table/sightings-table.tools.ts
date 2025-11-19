import { Filter } from '@/common/design-system/molecules/data-table/filters/filters.types';

export const sightingTableTools: Filter[] = [
  {
    type: 'command-single',
    id: 'role',
    title: 'Role',
    options: [
      {
        label: 'Domain Controller',
        value: 'domain controller',
      },
      {
        label: 'Printer',
        value: 'printer',
      },
      {
        label: 'DHCP Server',
        value: 'dhcp server',
      },
      {
        label: 'Proxy',
        value: 'proxy',
      },
      {
        label: 'Unclassified',
        value: 'unclassified',
      },
    ],
  },
];
