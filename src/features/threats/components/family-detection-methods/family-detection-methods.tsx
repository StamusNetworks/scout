import { useParams } from '@tanstack/react-router';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGetRulesQuery } from '@/features/detection-methods/api/rules.api';
import { detectionMethodsColumns } from '@/features/detection-methods/signatures/components/signatures-table/signatures-table.columns';
import { DetectionMethodsExpandedRow } from '@/features/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

export const FamilyDetectionMethods = () => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isLoading } = useGetRulesQuery(
    {
      ...queryParams,
      hits_min: 1,
      alert: true,
      stamus: true,
      discovery: true,
      ordering: queryParams.ordering ?? '-hits',
      qfilter: QFBuilder.toQFString(
        [QFBuilder.createFilter('stamus.family_id', familyId!)],
        { untagged: true, informational: true, relevant: true },
      ),
    },
    { skip: !familyId },
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
