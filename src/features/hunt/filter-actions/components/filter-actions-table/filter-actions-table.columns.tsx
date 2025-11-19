import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { FilterAction } from '@/features/hunt/filter-actions/model/filter-action';

import { FilterActionRowActions } from './filter-actions-table.row-actions';

const getRowDescription = (item: FilterAction) => {
  let description: React.ReactNode[] = [];
  if (item.action === 'threshold') {
    description.push(
      <div key="track">
        <strong>track</strong>: {item.options.track}
      </div>,
    );
  } else if (item.action === 'threat') {
    description.push(
      <div key="threat">
        <strong>threat</strong>: {item.options.threat}
      </div>,
    );
  } else if (item.action !== 'suppress') {
    description = (
      Object.keys(item.options) as (keyof typeof item.options)[]
    ).map((option) => (
      <div key={option}>
        <strong>{option}</strong>: {item.options[option]}
      </div>
    ));
  }
  return description;
};

export const getRowFilters = (item: FilterAction, size = 1) => {
  const filters = [];

  if (item.filter_defs.length === 0) {
    return [];
  }
  const limit = size || item.filter_defs.length;
  for (let i = 0; i < limit; i += 1) {
    let info = (
      <div key={item.filter_defs[i].key + '-' + item.filter_defs[i].value}>
        {item.filter_defs[i].operator === 'different' && 'Not '}
        <strong>{item.filter_defs[i].key}</strong>: {item.filter_defs[i].value}
      </div>
    );
    if (
      item.filter_defs[i].key === 'alert.signature_id' &&
      item.filter_defs[i].msg
    ) {
      info = (
        <div key={item.filter_defs[i].key + '-' + item.filter_defs[i].value}>
          {item.filter_defs[i].operator === 'different' && 'Not '}
          <strong>{item.filter_defs[i].key}</strong>:{' '}
          {item.filter_defs[i].value} ({item.filter_defs[i].msg})
        </div>
      );
    }
    filters.push(info);
  }
  if (size && size < item.filter_defs.length) {
    filters.push(
      <span key="more">and {item.filter_defs.length - size} more...</span>,
    );
  }
  return filters;
};

export const filterActionsColumns: CustomColumnDef<FilterAction>[] = [
  {
    id: 'filter-action-expanded',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Parameters"
      />
    ),
    cell: ({ row }) => <div>{getRowDescription(row.original)}</div>,
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Action"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'filters',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filters"
      />
    ),
    cell: ({ row }) => <div>{getRowFilters(row.original)}</div>,
  },
  {
    accessorKey: 'rulesets',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Rulesets"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'index',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Index"
      />
    ),
  },
  {
    id: 'control',
    header: () => null,
    cell: ({ row }) => <FilterActionRowActions filterAction={row.original} />,
  },
];
