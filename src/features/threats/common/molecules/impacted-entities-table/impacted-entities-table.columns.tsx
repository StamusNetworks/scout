import { Swords } from 'lucide-react';

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
import { Hostname } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { Network } from '@/features/host-insights/use-cases/host-details/molecules/host-details/network';
import { Roles } from '@/features/host-insights/use-cases/host-details/molecules/host-details/roles';
import { Username } from '@/features/host-insights/use-cases/host-details/molecules/host-details/username';
import { KillchainTag } from '@/features/threats/common/killchain/components/killchain-tag';

import { ImpactedEntity } from '../../../model/impacted-entity';
import { KILL_CHAIN_PHASES } from '../../../model/kill-chain';
import { ThreatKind } from '../../../model/threat';
import { EntityThreatTagsListTemplate } from '../entities-threat-tags-list/entities-threat-tags-list';
import { IpOrEntityEventValue } from '../ip-or-entity';
import { ImpactedEntitiesTableActions } from './impacted-entities-table.actions';

export const getColumns = ({
  threatId,
  kind = 'compromise',
  setKillchain,
}: {
  threatId?: number;
  kind?: ThreatKind;
  setKillchain: (kc: string) => void;
}): CustomColumnDef<ImpactedEntity>[] => [
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
        <IpOrEntityEventValue
          entity={row.original.value}
          offender={row.original.isOffender}
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
    accessorKey: 'assetType',
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
          {row.original.assetType?.toUpperCase()}
        </Badge>
      );
    },
  },

  {
    id: 'kill_chain',
    accessorKey: 'phase',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Kill Chain"
      />
    ),
    cell: ({ row }) => {
      const phase = row.original.phase;
      return (
        <KillchainTag
          kc={phase}
          status={row.original.status}
          onClick={() => setKillchain?.(phase)}
        />
      );
    },
  },
  {
    id: 'is_offender',
    cell: ({ row }) => {
      return (
        <Row className="justify-center">
          {row.original.isOffender ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Swords />
                </TooltipTrigger>
                <TooltipContent>Entity is an Offender</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </Row>
      );
    },
  },
  ...(!threatId
    ? ([
        {
          id: kind === 'compromise' ? 'threats' : 'policy_violations',
          header: ({ column }) => (
            <DataTableColumnHeader
              column={column}
              title={kind === 'compromise' ? 'Threats' : 'Policy Violations'}
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
      ] as CustomColumnDef<ImpactedEntity>[])
    : []),
  {
    id: 'first_seen',
    accessorKey: 'firstSeen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Incidents start"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.firstSeen} />,
  },
  {
    id: 'last_seen',
    accessorKey: 'lastSeen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.lastSeen} />,
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
          keyType={row.original.isOffender ? 'source' : 'target'}
        />
      </Column>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ImpactedEntitiesTableActions
        entityId={row.original.id}
        entityStatus={row.original.status}
        threatId={threatId}
        threatStatus={
          row.original.threats.find((threat) => threat.threatId === threatId)
            ?.status
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
    id: 'kind',
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
  kind = 'compromise',
}: {
  threatId?: number;
  kind?: ThreatKind;
}): ExportColumn<ImpactedEntity>[] => [
  {
    label: 'Entity',
    value: ({ value }) => value,
  },
  {
    label: 'Asset type',
    value: ({ assetType }) => assetType,
  },
  ...(kind === 'compromise'
    ? ([
        {
          label: 'Kill chain',
          value: ({ isOffender, phase, offenderPhase }) =>
            KILL_CHAIN_PHASES[isOffender ? offenderPhase : phase]?.name,
        },
        {
          label: 'Offender/Victim',
          value: ({ isOffender }) => (isOffender ? 'Offender' : 'Victim'),
        },
      ] as ExportColumn<ImpactedEntity>[])
    : []),
  ...(!threatId
    ? ([
        {
          label: kind === 'compromise' ? 'Threats' : 'Policy Violations',
          value: ({ threats }) => threats?.map((t) => t.name).join(', ') || '',
        },
      ] as ExportColumn<ImpactedEntity>[])
    : []),
  {
    label: 'First seen',
    value: ({ firstSeen }) => firstSeen.toISOString(),
  },
  {
    label: 'Last seen',
    value: ({ lastSeen }) => lastSeen.toISOString(),
  },
];
