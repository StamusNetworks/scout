import { parseAsBoolean, useQueryState } from 'nuqs';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { selectQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.selector';
import { useAppSelector } from '@/store/store';

import { useGetSignaturesQuery } from '../../api/signatures.api';
import {
  detectionMethodsColumns,
  exportColumns,
} from './signatures-table.columns';
import { DetectionMethodsExpandedRow } from './signatures-table.expanded-row';

export const SignaturesTable = () => {
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const [applyEventFilter, setApplyEventFilter] = useQueryState(
    'with_alerts',
    parseAsBoolean.withDefault(true),
  );
  const qfilters = useAppSelector(selectQueryFilters);
  const sidFilter = qfilters.find((f) => f.key === 'alert.signature_id')?.value;
  const { qfilter, ...params } = useGlobalQueryParams([
    'tenant',
    'dates',
    'qfilter',
    'qfilterSignature',
  ]);
  const { data, isFetching } = useGetSignaturesQuery({
    hits_min: applyEventFilter ? 1 : undefined,
    ...params,
    ...pagination,
    ...(sidFilter && { sid: sidFilter }),
    ...(applyEventFilter ? { qfilter } : {}),
    ordering: ordering ?? '-hits',
  });
  const toolBar = (
    <DataTableToolbar>
      <SwitchFilter
        title="Apply event filters"
        setValue={setApplyEventFilter}
        value={applyEventFilter}
      />
    </DataTableToolbar>
  );
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={detectionMethodsColumns}
      ExpandedRow={DetectionMethodsExpandedRow}
      getRowId={(row) => row.pk?.toString()}
      toolBar={toolBar}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      exportColumns={exportColumns}
    />
  );
};
