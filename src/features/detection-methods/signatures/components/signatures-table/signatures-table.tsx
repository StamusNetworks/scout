import { PencilRuler } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { useQueryFilters } from '@/features/query-filters';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetSignaturesQuery } from '../../api/signatures.api';
import {
  detectionMethodsColumns,
  exportColumns,
} from './signatures-table.columns';
import { DetectionMethodsExpandedRow } from './signatures-table.expanded-row';

export const SignaturesTable = () => {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({
    tableId: 'detectionMethodsTable',
    columns: detectionMethodsColumns,
  });
  const [applyEventFilter, setApplyEventFilter] = useQueryState(
    'with_alerts',
    parseAsBoolean.withDefault(true),
  );
  const qfilters = useQueryFilters();
  const sidFilter = qfilters
    .filter((f) => !f.is_suspended)
    .find((f) => f.key === 'alert.signature_id')?.value;
  const { qfilter, ...params } = useGlobalQueryParams([
    'tenant',
    'dates',
    'qfilter',
    'qfilterSignature',
  ]);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState({
      ...params,
      hits_min: applyEventFilter ? 1 : undefined,
      ...(sidFilter && { sid: sidFilter }),
      ...(applyEventFilter ? { qfilter } : {}),
    });
  const { data, isFetching } = useGetSignaturesQuery({
    ...queryParams,
    ordering: queryParams.ordering ?? '-hits',
  });
  const toolBar = (
    <DataTableToolbar>
      <SwitchFilter
        title="Apply event query filters"
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
      columnOrder={columnOrder}
      onColumnOrderChange={onColumnOrderChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      canReset={canReset}
      onClickReset={onClickReset}
      Empty={
        <DataTableEmpty
          Icon={PencilRuler}
          entity="detection methods"
        />
      }
    />
  );
};
