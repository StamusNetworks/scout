import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';
import { Hostname } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { Network } from '@/features/host-insights/use-cases/host-details/molecules/host-details/network';

import type { Event } from './events.model';

export const EXPANDER_COLUMN: CustomColumnDef<Event> = {
  id: 'event-expanded',
  cell: ({ row }) => <DataTableRowExpander row={row} />,
  enableHiding: false,
  meta: {
    canReorder: false,
  },
};

export const TIMESTAMP_COLUMN: CustomColumnDef<Event> = {
  id: 'timestamp',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Timestamp"
    />
  ),
  cell: ({ row }) => <DateTime date={row.original.timestamp} />,
};

export const SOURCE_COLUMN: CustomColumnDef<Event> = {
  id: 'source',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Source"
    />
  ),
  cell: ({ row }) => {
    const data = row.original.flow ? row.original.flow : row.original;
    const prefix = row.original.flow ? 'flow.' : '';
    return (
      <Column>
        <Row className="mb-1 gap-1">
          <EventValue
            query_key={`${prefix}src_ip`}
            value={data.src_ip}
          />
          <span>:</span>
          <EventValue
            query_key={`${prefix}src_port`}
            value={data.src_port}
          />
        </Row>
        <Hostname
          host={data.src_ip}
          size="small"
        />
        <Network
          host={data.src_ip}
          size="small"
        />
      </Column>
    );
  },
  meta: { viewLabel: 'Source IP' },
};

export const DESTINATION_COLUMN: CustomColumnDef<Event> = {
  id: 'destination',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Destination"
    />
  ),
  cell: ({ row }) => {
    const data = row.original.flow ? row.original.flow : row.original;
    const prefix = row.original.flow ? 'flow.' : '';
    return (
      <Column>
        <Row className="mb-1 gap-1">
          <EventValue
            query_key={`${prefix}dest_ip`}
            value={data.dest_ip}
          />
          <span>:</span>
          <EventValue
            query_key={`${prefix}dest_port`}
            value={data.dest_port}
          />
        </Row>
        <Hostname
          host={data.dest_ip}
          size="small"
        />
        <Network
          host={data.dest_ip}
          size="small"
        />
      </Column>
    );
  },
  meta: { viewLabel: 'Destination IP' },
};

export const PROTOCOL_COLUMN: CustomColumnDef<Event> = {
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
      value={row.original.app_proto}
    />
  ),
};

export const HOST_COLUMN: CustomColumnDef<Event> = {
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
};

export const HOSTNAME_HOST_COLUMN: CustomColumnDef<Event> = {
  id: 'hostname_host',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Hostname host"
    />
  ),
  cell: ({ row }) => (
    <EventValue
      query_key="hostname_info.host"
      value={row.original.hostname_info?.host}
    />
  ),
};
