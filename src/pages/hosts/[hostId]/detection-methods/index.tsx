import { PencilRuler } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import { detectionMethodsColumns } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.columns';
import { DetectionMethodsExpandedRow } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';

export const HostDetectionMethods = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data: detectionMethodsList, isFetching: isFetchingDetectionMethods } =
    useGetSignaturesQuery({
      ...params,
      host_id_qfilter: `ip:"${hostId}"`,
      ordering: ordering ?? '-hits',
      hits_min: 1,
      alert: true,
      stamus: true,
    });
  return (
    <DataTable
      data={detectionMethodsList}
      isLoading={isFetchingDetectionMethods}
      columns={detectionMethodsColumns}
      ExpandedRow={DetectionMethodsExpandedRow}
      getRowId={(row) => row.pk?.toString()}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      Empty={
        <DataTableEmpty
          Icon={PencilRuler}
          entity="detection methods"
        />
      }
    />
  );
};
