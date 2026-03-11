import { Biohazard } from 'lucide-react';
import { useParams } from '@tanstack/react-router';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';
import { threatStatusColumns } from '@/pages/hosts/[hostId]/incidents/threat-status.columns';
import { ThreatStatusExpandedRow } from '@/pages/hosts/[hostId]/incidents/threat-status.expanded-row';

const columns = threatStatusColumns
  .filter((col) => !['target', 'target_type'].includes(col.id!))
  .map((col) => ({ ...col, visible: true }));

export const HostIncidents = () => {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const params = useGlobalQueryParams(['tenant']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isFetching } = useGetThreatsStatusQuery({
    ...queryParams,
    asset: hostId,
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      ExpandedRow={ThreatStatusExpandedRow}
      Empty={
        <DataTableEmpty
          Icon={Biohazard}
          entity="incidents"
        />
      }
    />
  );
};
