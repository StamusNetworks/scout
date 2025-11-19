import {
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/design-system/atoms/ui/table';
import { DataTablePagination } from '@/common/design-system/molecules/data-table/data-table.pagination';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Paginated } from '@/common/fetching/fetching.types';

import { Row as RowComponent } from '../../atoms/layout/row';
import {
  Empty as EmptyComponent,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
} from '../../atoms/ui/empty';
import { Skeleton } from '../../atoms/ui/skeleton';
import { ExportButton } from '../export-button';
import { DataTableViewOptions } from './data-table.viewOptions';

export type ExportColumn<T> = {
  label: string;
  value: (value: T) => string;
};

interface NewTable<TData> {
  data: Paginated<TData> | undefined;
  isLoading?: boolean;
  columns: CustomColumnDef<TData>[];
  ExpandedRow?: ({
    row,
    index,
  }: {
    row: Row<TData>;
    index?: number;
  }) => JSX.Element;
  onRowClick?: (row: Row<TData>) => void;
  getRowId?: (
    originalRow: TData,
    index: number,
    parent?: Row<TData> | undefined,
  ) => string;
  serverSide?: boolean;
  skeletonRows?: number;
  // State management props
  sorting?: SortingState;
  onSortingChange?: (updater: Updater<SortingState>) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (updater: Updater<VisibilityState>) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: Updater<RowSelectionState>) => void;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (updater: Updater<ColumnFiltersState>) => void;
  pagination?: PaginationState;
  onPaginationChange?: (updater: Updater<PaginationState>) => void;
  expanded?: ExpandedState;
  onExpandedChange?: (updater: Updater<ExpandedState>) => void;
  // Components
  toolBar?: React.ReactNode;
  paginationbar?: boolean;
  Empty?: React.ReactNode;
  defaultPageSize?: number;
  rowClickCursor?: 'pointer' | 'default' | 'zoomin';
  exportColumns?: ExportColumn<TData>[];
}

export function DataTable<TData>({
  data,
  columns,
  ExpandedRow,
  onRowClick,
  getRowId,
  isLoading = false,
  serverSide = true,
  skeletonRows = 10,
  // State management props with defaults
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange: controlledOnColumnVisibilityChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange: controlledOnColumnFiltersChange,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  expanded: controlledExpanded,
  onExpandedChange: controlledOnExpandedChange,
  // Components
  toolBar,
  paginationbar = true,
  Empty,
  defaultPageSize = 10,
  rowClickCursor = 'zoomin',
  exportColumns,
}: NewTable<TData>) {
  // Local state management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columnsWithSkeleton = useMemo(
    () =>
      isLoading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton className="my-0.5 h-4 w-full" />,
          }))
        : columns,
    [isLoading, columns],
  );

  const tableData = React.useMemo(() => {
    if (isLoading) {
      return Array.from({ length: skeletonRows }).map(() => ({}) as TData);
    }
    return data?.results ?? [];
  }, [isLoading, data, skeletonRows]);

  const table = useReactTable({
    data: tableData,
    columns: columnsWithSkeleton,
    state: {
      sorting: controlledSorting ?? sorting,
      columnVisibility: controlledColumnVisibility ?? columnVisibility,
      rowSelection: controlledRowSelection ?? rowSelection,
      columnFilters: controlledColumnFilters ?? columnFilters,
      pagination: controlledPagination ?? pagination,
      expanded: controlledExpanded ?? expanded,
    },
    getRowId: getRowId,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    ...(serverSide
      ? { manualPagination: true, manualSorting: true }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    rowCount: data?.count ?? 0,
    onRowSelectionChange: controlledOnRowSelectionChange ?? setRowSelection,
    onPaginationChange: controlledOnPaginationChange ?? setPagination,
    onColumnFiltersChange: controlledOnColumnFiltersChange ?? setColumnFilters,
    onColumnVisibilityChange:
      controlledOnColumnVisibilityChange ?? setColumnVisibility,
    onSortingChange: controlledOnSortingChange ?? setSorting,
    onExpandedChange: controlledOnExpandedChange ?? setExpanded,
  });

  // hide visible false columns
  useEffect(() => {
    const hiddenColumns = columns
      .filter((col) => col.visible === false)
      .reduce((acc, curr) => ({ ...acc, [curr.id!]: false }), {});
    table.setColumnVisibility((state) => ({ ...state, ...hiddenColumns }));
  }, [columns, table]);

  return (
    <div
      className="space-y-2"
      data-testid="data-table"
    >
      <RowComponent className="items-center justify-between gap-4">
        <div>{toolBar}</div>
        <RowComponent className="gap-2">
          {exportColumns && (
            <ExportButton
              data={tableData.map((row) =>
                exportColumns.map((col) => col.value(row)),
              )}
              headers={exportColumns.map((col) => col.label)}
              className="h-8"
            />
          )}
          <DataTableViewOptions table={table} />
        </RowComponent>
      </RowComponent>
      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={rowVariants({
                      cursor: onRowClick ? rowClickCursor : 'default',
                    })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && !!ExpandedRow && (
                    <tr
                      key={row.id + '-expanded'}
                      className="table-row"
                    >
                      <td
                        colSpan={row.getVisibleCells().length}
                        className="border-border bg-card border-b"
                      >
                        <ExpandedRow
                          row={row}
                          index={index}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                {Empty ? (
                  <TableCell colSpan={columns.length}>{Empty}</TableCell>
                ) : (
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <EmptyComponent>
                      <EmptyMedia variant="icon">
                        <Search />
                      </EmptyMedia>
                      <EmptyContent>
                        <EmptyHeader>No results found</EmptyHeader>
                      </EmptyContent>
                    </EmptyComponent>
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {paginationbar && <DataTablePagination table={table} />}
    </div>
  );
}

const rowVariants = cva('', {
  variants: {
    cursor: {
      default: 'cursor-default',
      zoomin: 'cursor-zoom-in',
      pointer: 'cursor-pointer',
    },
  },
  defaultVariants: {
    cursor: 'default',
  },
});
