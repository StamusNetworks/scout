import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { KillchainTag } from '@/features/threats/components/kill-chain-tag/kill-chain-tag';
import { ThreatTag } from '@/features/threats/components/threat-tag/threat-tag';

import { EntityThreat } from '../../model/impacted-entity';
import { ThreatKind } from '../../model/threat';

export const ThreatsTable = ({
  data,
  kind,
}: {
  data: EntityThreat[];
  kind: ThreatKind;
}) => {
  const [pagination, setPagination] = usePaginationState();
  return (
    <DataTable
      serverSide={false}
      data={{
        results: data,
        count: data.length,
      }}
      columns={threatsColumns(kind)}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};

const threatsColumns = (kind: ThreatKind): CustomColumnDef<EntityThreat>[] => [
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
  },
  {
    id: 'kill_chain',
    header: 'Kill chain',
    cell: ({ row }) =>
      row.original.offenderPhase ? (
        <KillchainTag kc={row.original.offenderPhase} />
      ) : row.original.phase ? (
        <KillchainTag kc={row.original.phase} />
      ) : null,
  },
  {
    id: kind === 'compromise' ? 'threat' : 'policy_violation',
    header: kind === 'compromise' ? 'Threat' : 'Policy Violation',
    cell: ({ row }) => (
      <ThreatTag
        threat_id={row.original.threatId}
        kill_chain={row.original.phase ?? undefined}
        is_offender={row.original.isOffender}
        first_seen={row.original.firstSeen.toISOString()}
        last_seen={row.original.lastSeen.toISOString()}
        status={row.original.status}
      />
    ),
  },
  {
    id: 'first_seen',
    header: 'First seen',
    cell: ({ row }) => <DateTime date={row.original.firstSeen} />,
  },
  {
    id: 'last_seen',
    header: 'Last seen',
    cell: ({ row }) => <DateTime date={row.original.lastSeen} />,
  },
];
