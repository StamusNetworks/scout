import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Cell,
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { GripVertical, Search } from 'lucide-react';
import React, { CSSProperties, useEffect, useState } from 'react';

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
import { cn } from '@/common/lib/utils';

import { Row as RowComponent } from '../../atoms/layout/row';
import { Checkbox } from '../../atoms/ui/checkbox';
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
  }) => React.JSX.Element;
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

  const tableData = React.useMemo(() => {
    if (isLoading) {
      return Array.from({ length: skeletonRows }).map(() => ({}) as TData);
    }
    return data?.results ?? [];
  }, [isLoading, data, skeletonRows]);

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((col) => col.id!),
  );

  const table = useReactTable({
    data: tableData,
    columns: columns,
    state: {
      sorting: controlledSorting ?? sorting,
      columnVisibility: controlledColumnVisibility ?? columnVisibility,
      rowSelection: controlledRowSelection ?? rowSelection,
      columnFilters: controlledColumnFilters ?? columnFilters,
      pagination: controlledPagination ?? pagination,
      expanded: controlledExpanded ?? expanded,
      columnOrder: columnOrder,
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
    onColumnOrderChange: setColumnOrder,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

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
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="bg-card rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {controlledRowSelection && controlledOnRowSelectionChange && (
                    <th
                      className="px-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={
                          table.getIsSomeRowsSelected()
                            ? 'indeterminate'
                            : table.getIsAllRowsSelected()
                        }
                        onClick={table.getToggleAllRowsSelectedHandler()}
                      />
                    </th>
                  )}

                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <DataTableHead
                          header={header}
                          key={header.id}
                        />
                      );
                    })}
                  </SortableContext>
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
                      {controlledRowSelection &&
                        controlledOnRowSelectionChange && (
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="px-2"
                          >
                            <Checkbox
                              checked={row.getIsSelected()}
                              onCheckedChange={row.getToggleSelectedHandler()}
                            />
                          </td>
                        )}
                      {row.getVisibleCells().map((cell) => (
                        <SortableContext
                          key={cell.id}
                          items={columnOrder}
                          strategy={horizontalListSortingStrategy}
                        >
                          {isLoading ? (
                            <TableCell>
                              <Skeleton className="my-0.5 h-4 w-full" />
                            </TableCell>
                          ) : (
                            <DataTableCell cell={cell} />
                          )}
                        </SortableContext>
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
      </DndContext>
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

const DataTableHead = <TData,>({
  header,
}: {
  header: Header<TData, unknown>;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    zIndex: isDragging ? 1 : 0,
  };
  return (
    <TableHead
      key={header.id}
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
    >
      <RowComponent className="items-center gap-1">
        {header.column.columnDef.meta?.canReorder !== false && (
          <button
            {...attributes}
            {...listeners}
            className={cn(isDragging ? 'cursor-grabbing' : 'cursor-grab')}
          >
            <GripVertical />
          </button>
        )}
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </RowComponent>
    </TableHead>
  );
};

const DataTableCell = <TData,>({ cell }: { cell: Cell<TData, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell
      style={style}
      ref={setNodeRef}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};
