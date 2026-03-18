import { Row } from '@tanstack/react-table';

import { Column } from '@/common/design-system/atoms/layout/column';
import { DateTime } from '@/common/design-system/entities/date-time';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { FormattedBadge } from '@/common/design-system/molecules/formatted-badge';
import { Host } from '@/features/host-insights/common/host.model';
import { HostnameTemplate } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { NetworkTemplate } from '@/features/host-insights/use-cases/host-details/molecules/host-details/network';
import { RolesTemplate } from '@/features/host-insights/use-cases/host-details/molecules/host-details/roles';
import { UsernameTemplate } from '@/features/host-insights/use-cases/host-details/molecules/host-details/username';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

export const expanderColumn: CustomColumnDef<Host> = {
  id: 'expander',
  cell: ({ row }) => <DataTableRowExpander row={row} />,
};

export const hostColumn: CustomColumnDef<Host> = {
  id: 'host',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Host"
    />
  ),
  cell: ({ row }) => (
    <Column className="gap-1">
      <EventValue
        query_key="ip"
        value={row.original.ip}
      />
      <HostnameTemplate
        hostnames={row.original.host_id?.hostname}
        size="small"
      />
    </Column>
  ),
};

export const hostInfoColumn: CustomColumnDef<Host> = {
  id: 'host_info',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Usernames / Network"
    />
  ),
  cell: ({ row }) => (
    <Column>
      <UsernameTemplate usernames={row.original.host_id?.username} />
      <NetworkTemplate networks={row.original.host_id?.net_info} />
    </Column>
  ),
};

export const rolesColumn: CustomColumnDef<Host> = {
  id: 'roles',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Roles"
    />
  ),
  cell: ({ row }) => (
    <RolesTemplate
      roles={row.original.host_id?.roles}
      className="flex-wrap"
    />
  ),
};

export const servicesCountColumn: CustomColumnDef<Host> = {
  id: 'services_count',
  accessorFn: (row) => row.host_id?.services_count,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Services"
    />
  ),
};

export const firstSeenColumn: CustomColumnDef<Host> = {
  id: 'host_id.first_seen',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="First Seen"
    />
  ),
  accessorKey: 'host_id.first_seen',
  cell: ({ row }) => <DateTime date={row.original.host_id.first_seen} />,
  meta: { viewLabel: 'First Seen' },
};

export const lastSeenColumn: CustomColumnDef<Host> = {
  id: 'host_id.last_seen',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Last Seen"
    />
  ),
  accessorKey: 'host_id.last_seen',
  cell: ({ row }) => <DateTime date={row.original.host_id.last_seen} />,
  meta: { viewLabel: 'Last Seen' },
};

export const hitsColumn: CustomColumnDef<Host> = {
  id: 'hits',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Hits"
    />
  ),
  cell: ({ row }: { row: Row<Host> }) => (
    <FormattedBadge
      variant="secondary"
      value={row.original.hits || 0}
    />
  ),
};

// Base columns (without hits — route adds it conditionally)
export const hostsBaseColumns: CustomColumnDef<Host>[] = [
  expanderColumn,
  hostColumn,
  hostInfoColumn,
  rolesColumn,
  servicesCountColumn,
  firstSeenColumn,
  lastSeenColumn,
];

// Keep backward-compatible alias during migration
export const columns = hostsBaseColumns;

export const exportColumns: ExportColumn<Host>[] = [
  {
    label: 'IP',
    value: ({ ip }) => ip,
  },
  {
    label: 'Hostname',
    value: ({ host_id }) =>
      host_id?.hostname?.map(({ host }) => host).join(', ') || '',
  },
  {
    label: 'Username',
    value: ({ host_id }) =>
      host_id?.username?.map(({ user }) => user).join(', ') || '',
  },
  {
    label: 'Network',
    value: ({ host_id }) =>
      host_id?.net_info?.map(({ agg }) => agg).join(', ') || '',
  },
  {
    label: 'Roles',
    value: ({ host_id }) =>
      host_id?.roles?.map(({ name }) => name).join(', ') || '',
  },
  {
    label: 'Services',
    value: ({ host_id }) =>
      host_id?.services
        ?.map(({ proto, port }) => `${proto}/${port}`)
        .join(', ') || '',
  },
  {
    label: 'First seen',
    value: ({ host_id }) => host_id?.first_seen,
  },
  {
    label: 'Last seen',
    value: ({ host_id }) => host_id?.last_seen,
  },
  {
    label: 'Hits',
    value: ({ hits }) => hits?.toString(),
  },
];
