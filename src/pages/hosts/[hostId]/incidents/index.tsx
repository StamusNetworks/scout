import { Biohazard } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';
import { threatStatusColumns } from '@/pages/hosts/[hostId]/incidents/threat-status.columns';
import { ThreatStatusExpandedRow } from '@/pages/hosts/[hostId]/incidents/threat-status.expanded-row';

const columns = threatStatusColumns
  .filter((col) => !['target', 'target_type'].includes(col.id!))
  .map((col) => ({ ...col, visible: true }));

export const HostIncidents = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant']);
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data, isFetching } = useGetThreatsStatusQuery({
    ...params,
    ...pagination,
    asset: hostId,
    ordering,
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
