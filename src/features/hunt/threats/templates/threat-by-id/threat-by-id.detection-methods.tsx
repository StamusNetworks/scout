import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { detectionMethodsColumns } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.columns';
import { DetectionMethodsExpandedRow } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';

import { useThreatDetectionMethods } from '../../hooks/use-threat-detection-methods';

export const ThreatByIdDetectionMethods = () => {
  const { threatId } = useParams();
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data, isLoading } = useThreatDetectionMethods({
    threatId: threatId!,
    pagination,
    ordering,
  });
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
