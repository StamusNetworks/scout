import { useParams } from '@tanstack/react-router';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useQFBuilder } from '@/features/filtering/query-filters/hooks/use-qf-builder';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import { detectionMethodsColumns } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.columns';
import { DetectionMethodsExpandedRow } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';

export const ThreatByIdDetectionMethods = () => {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isLoading } = useGetSignaturesQuery(
    {
      ...queryParams,
      hits_min: 1,
      alert: true,
      stamus: true,
      discovery: true,
      ordering: queryParams.ordering ?? '-hits',
      qfilter: QFBuilder.toQFString(
        [QFBuilder.createFilter('stamus.threat_id', threatId!)],
        { untagged: true, informational: true, relevant: true },
      ),
    },
    { skip: !threatId },
  );
  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={detectionMethodsColumns}
      ExpandedRow={DetectionMethodsExpandedRow}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
};
