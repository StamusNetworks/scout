import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { cn } from '@/common/lib/utils';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../common/model/event.schema';

export const TAG_COLUMN: CustomColumnDef<Event> = {
  id: 'tag',
  header: () => null,
  cell: ({ row }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger onClick={(e) => e.stopPropagation()}>
          <div
            className={cn('size-2 rounded-full', {
              'bg-untagged': row.original.alert?.tag === undefined,
              'bg-informational': row.original.alert?.tag === 'informational',
              'bg-relevant': row.original.alert?.tag === 'relevant',
            })}
          />
        </TooltipTrigger>
        <TooltipContent>{row.original.alert?.tag || 'Untagged'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  meta: {
    canReorder: false,
  },
};

export const METHOD_COLUMN: CustomColumnDef<Event> = {
  id: 'method',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Method"
    />
  ),
  cell: ({ row }) =>
    row.original.alert?.signature ? (
      <EventValue
        query_key="alert.signature"
        value={row.original.alert?.signature}
        className="line-clamp-2 max-w-112 min-w-80 whitespace-break-spaces"
      />
    ) : row.original.event_type === 'stamus' ? (
      row.original.stamus?.threat_name
    ) : null,
};

export const CATEGORY_COLUMN: CustomColumnDef<Event> = {
  id: 'category',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Category"
    />
  ),
  cell: ({ row }) => (
    <div className="max-w-48">
      <EventValue
        query_key="alert.category"
        value={row.original.alert?.category}
      />
    </div>
  ),
};

export const LATERAL_COLUMN: CustomColumnDef<Event> = {
  id: 'lateral',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Lateral"
    />
  ),
  cell: ({ row }) => (
    <EventValue
      query_key="alert.lateral"
      value={row.original.alert?.lateral}
    />
  ),
};

export const OUTLIER_COLUMN: CustomColumnDef<Event> = {
  id: 'outlier',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Outlier"
    />
  ),
  cell: ({ row }) => (
    <EventValue
      query_key="stamus_novel"
      value={(!!row.original.stamus_novel).toString()}
    />
  ),
};

export const EXPORT_COLUMNS: {
  label: string;
  value: (event: Event) => string;
}[] = [
  {
    label: 'Timestamp',
    value: (event) => event.timestamp,
  },
  {
    label: 'Method',
    value: (event) =>
      event.alert?.signature ||
      (event.event_type === 'stamus' && event.stamus?.threat_name) ||
      '',
  },
  {
    label: 'Source IP',
    value: (event) => event.src_ip || event.flow?.src_ip || '',
  },
  {
    label: 'Destination IP',
    value: (event) => event.dest_ip || event.flow?.dest_ip || '',
  },
  {
    label: 'Proto',
    value: (event) => event.app_proto || '',
  },
  {
    label: 'Probe',
    value: (event) => event.host || '',
  },
  {
    label: 'Category',
    value: (event) => event.alert?.category || '',
  },
];
