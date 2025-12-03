import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { ThreatTag } from '@/features/hunt/threats/components/threat-tag';

type EntityThreat = {
  status: 'new' | 'fixed';
  first_seen: string;
  last_seen: string;
  threat__threat_id: number;
  threat__name: string;
  threat__family__family_id: number;
  kill_chain: number;
  kill_chain_offender: number;
};

export const ThreatsTable = ({
  data,
  type,
}: {
  data: {
    status: 'new' | 'fixed';
    first_seen: string;
    last_seen: string;
    threat__threat_id: number;
    threat__name: string;
    threat__family__family_id: number;
    kill_chain: number;
    kill_chain_offender: number;
  }[];
  type: 'doc' | 'dopv';
}) => {
  const [pagination, setPagination] = usePaginationState();
  return (
    <DataTable
      serverSide={false}
      data={{
        results: data,
        count: data.length,
      }}
      columns={threatsColumns(type)}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};

const threatsColumns = (
  type: 'doc' | 'dopv',
): CustomColumnDef<EntityThreat>[] => [
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
  },
  {
    id: 'kill_chain',
    header: 'Kill chain',
    cell: ({ row }) =>
      row.original.kill_chain_offender ? (
        <KillchainTag kc={row.original.kill_chain_offender} />
      ) : (
        <KillchainTag kc={row.original.kill_chain} />
      ),
  },
  {
    id: type === 'doc' ? 'threat' : 'policy_violation',
    header: type === 'doc' ? 'Threat' : 'Policy Violation',
    cell: ({ row }) => <ThreatTag threat={row.original} />,
  },
  {
    id: 'first_seen',
    header: 'First seen',
    cell: ({ row }) => <DateTime date={row.original.first_seen} />,
  },
  {
    id: 'last_seen',
    header: 'Last seen',
    cell: ({ row }) => <DateTime date={row.original.last_seen} />,
  },
];
