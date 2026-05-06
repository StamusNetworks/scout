import type { SortingState, Updater } from '@tanstack/react-table';
import { PencilRuler, RotateCcw } from 'lucide-react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { ExportButton } from '@/features/preferences';
import { useQueryFilters } from '@/features/query-filters';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetRulesQuery } from '../../api/rules.api';
import {
  rulesTableColumns,
  rulesTableExportColumns,
} from './rules-table.columns';
import { RuleExpandedRow } from './rules-table.expanded-row';

interface RulesTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  withAlerts: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onWithAlertsChange: (withAlerts: boolean) => void;
}

export function RulesTable({
  page,
  pageSize,
  sorting,
  withAlerts,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onWithAlertsChange,
}: RulesTableProps) {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({
    tableId: 'detectionMethodsTable',
    columns: rulesTableColumns,
  });

  const qfilters = useQueryFilters();
  const sidFilter = qfilters
    .filter((f) => !f.isSuspended)
    .find((f) => f.key === 'alert.signature_id')?.value;

  const { qfilter, ...globalParams } = useGlobalQueryParams([
    'tenant',
    'dates',
    'qfilter',
    'qfilterSignature',
  ]);

  const ordering = serializeSorting(sorting);

  const { data, isFetching } = useGetRulesQuery({
    ...globalParams,
    hits_min: withAlerts ? 1 : undefined,
    ...(sidFilter && { sid: sidFilter }),
    ...(withAlerts ? { qfilter } : {}),
    page,
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
              rulesTableExportColumns.map((col) => col.value(row)),
            )}
            headers={rulesTableExportColumns.map((col) => col.label)}
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
        columns={rulesTableColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
        ExpandedRow={RuleExpandedRow}
        getRowId={(row) => row.id?.toString()}
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
