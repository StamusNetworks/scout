import { PencilRuler, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { ExportButton } from '@/common/design-system/molecules/export-button';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetSignaturesQuery } from '@/features/detection-methods/detection-methods.api';
import {
  DETECTION_METHODS_COLUMNS,
  DETECTION_METHODS_EXPORT_COLUMNS,
} from '@/features/detection-methods/detection-methods.table';
import { DetectionMethodsExpandedRow } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';
import { selectQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.selector';
import { useAppSelector } from '@/store/store';

interface DetectionMethodsTableProps {
  search: {
    page: number;
    page_size: number;
    sort: string;
    with_alerts: boolean;
  };
  navigate: (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => void;
}

export function DetectionMethodsTable({
  search,
  navigate,
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

  // with_alerts toggle from URL search params
  const applyEventFilter = search.with_alerts;
  const toggleApplyEventFilter = (checked: boolean) => {
    navigate({
      search: (prev) => ({ ...prev, with_alerts: checked, page: 1 }),
    });
  };

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

  // Pagination / sorting from URL search params
  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(
      { search, navigate },
      {
        resetOn: [
          globalParams.start_date,
          globalParams.end_date,
          globalParams.tenant,
          qfilter,
          sidFilter,
        ],
      },
    );

  // Build query params
  const ordering = serializeSorting(sorting);
  const queryParams = useMemo(
    () => ({
      ...globalParams,
      hits_min: applyEventFilter ? 1 : undefined,
      ...(sidFilter && { sid: sidFilter }),
      ...(applyEventFilter ? { qfilter } : {}),
      pageIndex: page - 1,
      pageSize,
      ordering: ordering ?? '-hits',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      page,
      pageSize,
      ordering,
      applyEventFilter,
      sidFilter,
      globalParams.start_date,
      globalParams.end_date,
      globalParams.tenant,
      qfilter,
    ],
  );

  // Fetch data
  const { data, isFetching } = useGetSignaturesQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Row className="items-center justify-between gap-2">
        <DataTableToolbar>
          <SwitchFilter
            title="Apply event query filters"
            setValue={toggleApplyEventFilter}
            value={applyEventFilter}
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
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
