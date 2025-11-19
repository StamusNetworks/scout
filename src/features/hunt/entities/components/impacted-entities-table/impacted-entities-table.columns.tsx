import { Crosshair, Swords } from 'lucide-react';
import { isNil } from 'ramda';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
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
import { Hostname } from '@/features/analytics/hosts/components/host-details/hostname';
import { Network } from '@/features/analytics/hosts/components/host-details/network';
import { Roles } from '@/features/analytics/hosts/components/host-details/roles';
import { Username } from '@/features/analytics/hosts/components/host-details/username';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { killChainsConfig } from '@/features/hunt/killchain/killchain';

import { Entity } from '../../model/entity';
import { EntityThreatTagsListTemplate } from '../entities-threat-tags-list/entities-threat-tags-list';
import { ImpactedEntitiesTableActions } from './impacted-entities-table.actions';

export const getColumns = ({
  threatId,
  familyClass = 'doc',
  setKillchain,
}: {
  threatId?: number;
  familyClass?: 'doc' | 'dopv';
  setKillchain: (kc: string) => void;
}): CustomColumnDef<Entity>[] => [
  {
    id: 'event-expanded',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
    enableHiding: false,
  },
  {
    id: 'entities',
    accessorKey: 'entities',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Entities"
      />
    ),
    cell: ({ row }) => (
      <Column className="gap-1">
        <EventValue
          query_key="stamus.asset"
          value={row.original.value}
        />
        <Hostname
          host={row.original.value}
          size="small"
        />
      </Column>
    ),
  },
  {
    id: 'asset_type',
    accessorKey: 'asset_type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Type"
      />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          className="rounded-full"
          variant="secondary"
        >
          {row.original.asset_type?.toUpperCase()}
        </Badge>
      );
    },
  },
  ...(familyClass === 'doc'
    ? ([
        {
          id: 'kill_chain',
          accessorKey: 'kill_chain',
          header: ({ column }) => (
            <DataTableColumnHeader
              column={column}
              title="Kill Chain"
            />
          ),
          cell: ({ row }) => {
            const kc = row.original.is_offender
              ? row.original.kill_chain_offender
              : row.original.kill_chain;
            return (
              <KillchainTag
                kc={kc}
                status={row.original.status}
                onClick={() => setKillchain?.(kc)}
              />
            );
          },
        },
      ] as CustomColumnDef<Entity>[])
    : []),
  {
    id: familyClass === 'doc' ? 'is_offender' : 'victim',
    header: ({ column }) =>
      familyClass === 'doc' ? null : (
        <DataTableColumnHeader
          column={column}
          title="Victim"
        />
      ),
    cell: ({ row }) => {
      const shouldDisplay =
        familyClass === 'doc'
          ? true
          : row.original.is_offender
            ? !isNil(row.original.kill_chain_offender) &&
              row.original.kill_chain_offender !== 'pre_condition'
            : !isNil(row.original.kill_chain) &&
              row.original.kill_chain !== 'pre_condition';
      return shouldDisplay ? (
        <Row className="justify-center">
          {row.original.is_offender ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Swords />
                </TooltipTrigger>
                <TooltipContent>Entity is an Offender</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Crosshair />
                </TooltipTrigger>
                <TooltipContent>Entity is a Victim</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Row>
      ) : null;
    },
  },
  ...(!threatId
    ? ([
        {
          id: familyClass === 'doc' ? 'threats' : 'policy_violations',
          header: ({ column }) => (
            <DataTableColumnHeader
              column={column}
              title={familyClass === 'doc' ? 'Threats' : 'Policy Violations'}
            />
          ),
          cell: ({ row }) => {
            return (
              <EntityThreatTagsListTemplate
                threats={row.original.threats}
                maxThreats={3}
                className="flex-wrap"
              />
            );
          },
        },
      ] as CustomColumnDef<Entity>[])
    : []),
  {
    id: 'first_seen',
    accessorKey: 'first_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Incidents start"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.first_seen} />,
  },
  {
    id: 'last_seen',
    accessorKey: 'last_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.last_seen} />,
  },
  {
    id: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Roles"
      />
    ),
    cell: ({ row }) => (
      <Roles
        host={row.original.value}
        className="flex-wrap"
      />
    ),
  },
  {
    id: 'network_def',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Host Info"
      />
    ),
    cell: ({ row }) => (
      <Column>
        <Username host={row.original.value} />
        <Network
          host={row.original.value}
          keyType={row.original.is_offender ? 'source' : 'target'}
        />
      </Column>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ImpactedEntitiesTableActions
        entityId={row.original.pk}
        entityStatus={row.original.status}
        threatId={threatId}
        threatStatus={
          row.original.threats.find(
            (threat) => threat.threat__threat_id === threatId,
          )?.status
        }
      />
    ),
  },
  {
    id: 'status',
    enableHiding: false,
    visible: false,
  },
  {
    id: 'family_class',
    enableHiding: false,
    visible: false,
  },
  {
    id: 'search',
    enableHiding: false,
    visible: false,
  },
];

export const exportThreatsColumns = ({
  threatId,
  familyClass = 'doc',
}: {
  threatId?: number;
  familyClass?: 'doc' | 'dopv';
}): ExportColumn<Entity>[] => [
  {
    label: 'Entity',
    value: ({ value }) => value,
  },
  {
    label: 'Asset type',
    value: ({ asset_type }) => asset_type,
  },
  ...(familyClass === 'doc'
    ? ([
        {
          label: 'Kill chain',
          value: ({ is_offender, kill_chain, kill_chain_offender }) =>
            killChainsConfig?.[is_offender ? kill_chain_offender : kill_chain]
              ?.name,
        },
        {
          label: 'Offender/Victim',
          value: ({ is_offender }) => (is_offender ? 'Offender' : 'Victim'),
        },
      ] as ExportColumn<Entity>[])
    : []),
  ...(!threatId
    ? ([
        {
          label: familyClass === 'doc' ? 'Threats' : 'Policy Violations',
          value: ({ threats }) =>
            threats?.map((t) => t.threat__name).join(', ') || '',
        },
      ] as ExportColumn<Entity>[])
    : []),
  {
    label: 'First seen',
    value: ({ first_seen }) => first_seen,
  },
  {
    label: 'Last seen',
    value: ({ last_seen }) => last_seen,
  },
];
