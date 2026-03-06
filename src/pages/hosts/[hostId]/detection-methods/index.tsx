import { PencilRuler } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import { detectionMethodsColumns } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.columns';
import { DetectionMethodsExpandedRow } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';

export const HostDetectionMethods = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data: detectionMethodsList, isFetching: isFetchingDetectionMethods } =
    useGetSignaturesQuery({
      ...queryParams,
      host_id_qfilter: `ip:"${esEscape(hostId ?? '')}"`,
      ordering: queryParams.ordering ?? '-hits',
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
