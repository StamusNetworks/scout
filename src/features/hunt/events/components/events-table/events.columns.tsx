import { Column } from '@/common/design-system/atoms/layout/column';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { DateTime } from '@/common/design-system/entities/date-time';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { cn } from '@/common/lib/utils';
import { Hostname } from '@/features/analytics/hosts/components/host-details/hostname';
import { Network } from '@/features/analytics/hosts/components/host-details/network';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { Event } from '../../model/event.schema';

export const columns: CustomColumnDef<Event>[] = [
  {
    id: 'event-expanded',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
    enableHiding: false,
  },
  {
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
          <TooltipContent>
            {row.original.alert?.tag || 'Untagged'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Timestamp"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.timestamp} />,
  },
  {
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
          className="line-clamp-2 max-w-[28rem] whitespace-break-spaces"
        />
      ) : (
        row.original.stamus?.threat_name
      ),
  },
  {
    accessorKey: 'src_ip',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Source IP"
      />
    ),
    cell: ({ row }) => (
      <Column className="gap-1">
        {row.original.flow?.src_ip ? (
          <>
            <EventValue
              query_key="flow.src_ip"
              value={row.original.flow.src_ip}
            />
            <Hostname
              host={row.original.flow.src_ip}
              size="small"
            />
            <Network
              host={row.original.flow.src_ip}
              size="small"
            />
          </>
        ) : (
          <>
            <EventValue
              query_key="src_ip"
              value={row.original.src_ip}
            />
            <Hostname
              host={row.original.src_ip}
              size="small"
            />
            <Network
              host={row.original.src_ip}
              size="small"
            />
          </>
        )}
      </Column>
    ),
    meta: { viewLabel: 'Source IP' },
  },
  {
    accessorKey: 'dest_ip',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Destination IP"
      />
    ),
    cell: ({ row }) => (
      <Column className="gap-1">
        {row.original.flow?.dest_ip ? (
          <>
            <EventValue
              query_key="flow.dest_ip"
              value={row.original.flow.dest_ip}
            />
            <Hostname
              host={row.original.flow.dest_ip}
              size="small"
            />
            <Network
              host={row.original.flow.dest_ip}
              size="small"
            />
          </>
        ) : (
          <>
            <EventValue
              query_key="dest_ip"
              value={row.original.dest_ip}
            />
            <Hostname
              host={row.original.dest_ip}
              size="small"
            />
            <Network
              host={row.original.dest_ip}
              size="small"
            />
          </>
        )}
      </Column>
    ),
    meta: { viewLabel: 'Destination IP' },
  },
  {
    id: 'protocol',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Proto"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="app_proto"
        value={row.original.app_proto || row.original.proto}
      />
    ),
  },
  {
    id: 'host',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Probe"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="host"
        value={row.original.host}
      />
    ),
  },
  {
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
  },
];

export const exportColumns: ExportColumn<Event>[] = [
  {
    label: 'Timestamp',
    value: (event) => event.timestamp,
  },
  {
    label: 'Method',
    value: (event) => event.alert?.signature || event.stamus?.threat_name,
  },
  {
    label: 'Source IP',
    value: (event) => event.src_ip || event.flow?.src_ip,
  },
  {
    label: 'Destination IP',
    value: (event) => event.dest_ip || event.flow?.dest_ip,
  },
  {
    label: 'Proto',
    value: (event) => event.app_proto || event.proto,
  },
  {
    label: 'Probe',
    value: (event) => event.host,
  },
  {
    label: 'Category',
    value: (event) => event.alert?.category,
  },
];
