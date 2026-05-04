import type { SortingState, Updater } from '@tanstack/react-table';
import { PencilRuler, RotateCcw } from 'lucide-react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { ExportButton } from '@/common/design-system/molecules/export-button';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { useGetSignaturesQuery } from '@/features/detection-methods/detection-methods.api';
import {
  DETECTION_METHODS_COLUMNS,
  DETECTION_METHODS_EXPORT_COLUMNS,
} from '@/features/detection-methods/detection-methods.table';
import { DetectionMethodsExpandedRow } from '@/features/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';
import { selectQueryFilters } from '@/features/filtering/filters/query-filters/query-filters.selectors';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { useAppSelector } from '@/store/store';

interface DetectionMethodsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  withAlerts: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onWithAlertsChange: (withAlerts: boolean) => void;
}

export function DetectionMethodsTable({
  page,
  pageSize,
  sorting,
  withAlerts,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onWithAlertsChange,
}: DetectionMethodsTableProps) {
  // Table column preferences
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({
    tableId: 'detectionMethodsTable',
    columns: DETECTION_METHODS_COLUMNS,
  });

  // SID filter from Redux query filters
  const qfilters = useAppSelector(selectQueryFilters);
  const sidFilter = qfilters
    .filter((f) => !f.is_suspended)
    .find((f) => f.key === 'alert.signature_id')?.value;

  // Global params from Redux
  const { qfilter, ...globalParams } = useGlobalQueryParams([
    'tenant',
    'dates',
    'qfilter',
    'qfilterSignature',
  ]);

  // Build query params
  const ordering = serializeSorting(sorting);

  // Fetch data
  const { data, isFetching } = useGetSignaturesQuery({
    ...globalParams,
    hits_min: withAlerts ? 1 : undefined,
    ...(sidFilter && { sid: sidFilter }),
    ...(withAlerts ? { qfilter } : {}),
    pageIndex: page - 1,
    pageSize,
    ordering: ordering ?? '-hits',
  });

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Row className="items-center justify-between gap-2">
        <DataTableToolbar>
          <SwitchFilter
            title="Apply event query filters"
            setValue={onWithAlertsChange}
            value={withAlerts}
          />
        </DataTableToolbar>

        <Row className="items-center gap-2">
          <ExportButton
            data={results.map((row) =>
              DETECTION_METHODS_EXPORT_COLUMNS.map((col) => col.value(row)),
            )}
            headers={DETECTION_METHODS_EXPORT_COLUMNS.map((col) => col.label)}
            className="h-8"
          />
          {canReset && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-8 border-dashed lg:flex"
              onClick={onClickReset}
              aria-label="Reset table view"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </Row>
      </Row>

      <Table
        data={results}
        columns={DETECTION_METHODS_COLUMNS}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
        ExpandedRow={DetectionMethodsExpandedRow}
        getRowId={(row) => row.pk?.toString()}
        Empty={
          <DataTableEmpty
            Icon={PencilRuler}
            entity="detection methods"
          />
        }
      />

      {total > 0 && (
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
