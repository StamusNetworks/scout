import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { DateTime } from '@/common/design-system/entities/date-time';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Filter } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Event } from '@/features/events/model/event';
import { Hostname } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { Network } from '@/features/host-insights/use-cases/host-details/molecules/host-details/network';
import { RoleBadge } from '@/features/host-insights/use-cases/host-details/molecules/host-details/roles';
import { Username } from '@/features/host-insights/use-cases/host-details/molecules/host-details/username';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';
import { EntityThreatTagsList } from '@/features/threats/components/entities-threat-tags-list/entities-threat-tags-list';
import { IpOrEntityEventValue } from '@/features/threats/components/ip-or-entity/ip-or-entity';

export const hostSightingTableColumns: CustomColumnDef<Event>[] = [
  {
    id: 'protocol',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Protocol"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="app_proto"
        value={row.original.app_proto}
      />
    ),
  },
  {
    id: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Role"
      />
    ),
    cell: ({ row }) =>
      row.original.discovery &&
      row.original.discovery.asset_role?.length > 0 ? (
        <Row className="gap-1">
          {row.original.discovery.asset_role.map((role) => (
            <RoleBadge
              key={role}
              role={role}
            />
          ))}
        </Row>
      ) : (
        <RoleBadge role="unclassified" />
      ),
    enableSorting: false,
  },
  {
    id: 'key',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Key"
      />
    ),
    accessorFn: (row) => row.discovery?.key || '',
    enableSorting: false,
  },
  {
    id: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Value"
      />
    ),
    cell: ({ row }) =>
      row.original.discovery && (
        <EventValue
          query_key={row.original.discovery.key}
          value={row.original.discovery.value}
        />
      ),
  },
  {
    id: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Discovered"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.timestamp} />,
    meta: { viewLabel: 'Discovered' },
  },
];

export const allSightingsTableColumns: CustomColumnDef<Event>[] = [
  {
    id: 'entity',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Entity"
      />
    ),
    cell: ({ row }) =>
      row.original.discovery && (
        <Column>
          <IpOrEntityEventValue
            entity={row.original.discovery.asset}
            offender={false}
          />
          <Hostname
            host={row.original.discovery.asset}
            size="small"
          />
        </Column>
      ),
  },
  {
    id: 'threats',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Threats"
      />
    ),
    enableSorting: false,
    cell: ({ row }) =>
      row.original.discovery && (
        <EntityThreatTagsList
          className="max-w-72 flex-wrap"
          entity={row.original.discovery.asset}
          maxThreats={3}
        />
      ),
  },
  {
    id: 'network_info',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Network info"
      />
    ),
    cell: ({ row }) =>
      row.original.discovery && (
        <Column>
          <Network host={row.original.discovery.asset} />
          <Username host={row.original.discovery.asset} />
        </Column>
      ),
  },
  {
    id: 'discovered',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Discovered"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.timestamp} />,
  },
  {
    id: 'probe',
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
    id: 'key',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Key"
      />
    ),
    accessorFn: (row) => row.discovery?.key || '',
    enableSorting: false,
  },
  {
    id: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Value"
      />
    ),
    cell: ({ row }) =>
      row.original.discovery && (
        <EventValue
          query_key={row.original.discovery.key}
          value={row.original.discovery.value}
          className="line-clamp-4 max-w-128 break-all whitespace-pre-wrap"
        />
      ),
    enableSorting: false,
  },
  {
    id: 'role',
  },
];

export const allSightingsExport: ExportColumn<Event>[] = [
  {
    label: 'Entity',
    value: ({ discovery }) => discovery?.asset || '',
  },
  {
    label: 'Discovered',
    value: ({ timestamp }) => timestamp,
  },
  {
    label: 'Probe',
    value: ({ host }) => host || '',
  },
  {
    label: 'Key',
    value: ({ discovery }) => discovery?.key || '',
  },
  {
    label: 'Value',
    value: ({ discovery }) => discovery?.value || '',
  },
];

export const sightingRoleOptions = [
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
];

export const sightingTableFilters: Filter[] = [
  {
    type: 'command-single',
    id: 'role',
    title: 'Role',
    options: sightingRoleOptions,
  },
];
