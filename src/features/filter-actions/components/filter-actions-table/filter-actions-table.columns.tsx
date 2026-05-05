import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { FilterAction } from '@/features/filter-actions/model/filter-action';

import { FilterActionRowActions } from './filter-actions-table.row-actions';

const getRowDescription = (item: FilterAction) => {
  let description: React.ReactNode[] = [];
  if (item.kind === 'threshold') {
    description.push(
      <div key="track">
        <strong>track</strong>: {item.options.track}
      </div>,
    );
  } else if (item.kind === 'threat') {
    description.push(
      <div key="threat">
        <strong>threat</strong>: {item.options.threat}
      </div>,
    );
  } else if (item.kind !== 'suppress') {
    description = (
      Object.keys(item.options) as (keyof typeof item.options)[]
    ).map((option) => (
      <div key={option}>
        <strong>{option}</strong>: {String(item.options[option])}
      </div>
    ));
  }
  return description;
};

export const getRowFilters = (item: FilterAction, size = 1) => {
  const filters = [];

  if (item.filterDefs.length === 0) {
    return [];
  }
  const limit = size || item.filterDefs.length;
  for (let i = 0; i < limit; i += 1) {
    const def = item.filterDefs[i];
    let info = (
      <div key={def.key + '-' + def.value}>
        {def.isNegated && 'Not '}
        <strong>{def.key}</strong>: {def.value}
      </div>
    );
    if (def.key === 'alert.signature_id' && def.msg) {
      info = (
        <div key={def.key + '-' + def.value}>
          {def.isNegated && 'Not '}
          <strong>{def.key}</strong>: {def.value} ({def.msg})
        </div>
      );
    }
    filters.push(info);
  }
  if (size && size < item.filterDefs.length) {
    filters.push(
      <span key="more">and {item.filterDefs.length - size} more...</span>,
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
    id: 'id',
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
    id: 'action',
    accessorKey: 'kind',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Action"
      />
    ),
    enableSorting: false,
  },
  {
    id: 'filters',
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
    id: 'rulesets',
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
    id: 'index',
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
