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
  ExpandedState,
  flexRender,
  getCoreRowModel,
  Header,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  Updater,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { GripVertical, Search } from 'lucide-react';
import React, { CSSProperties } from 'react';

import {
  Table as TablePrimitive,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/design-system/atoms/ui/table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
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

export interface TableProps<TData> {
  data: TData[];
  columns: CustomColumnDef<TData>[];
  isLoading?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  columnOrder?: string[];
  onColumnOrderChange?: (order: Updater<string[]>) => void;
  ExpandedRow?: ({
    row,
    index,
  }: {
    row: Row<TData>;
    index?: number;
  }) => React.JSX.Element;
  onRowClick?: (row: Row<TData>) => void;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  skeletonRows?: number;
  Empty?: React.ReactNode;
  rowClickCursor?: 'pointer' | 'default' | 'zoomin';
  reorder?: boolean;
}

export function Table<TData>({
  data,
  columns,
  isLoading = false,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  expanded,
  onExpandedChange,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
  ExpandedRow,
  onRowClick,
  getRowId,
  skeletonRows = 10,
  Empty,
  rowClickCursor = 'zoomin',
  reorder = true,
}: TableProps<TData>) {
  const tableData = React.useMemo(() => {
    if (isLoading) {
      return Array.from({ length: skeletonRows }).map(() => ({}) as TData);
    }
    return data;
  }, [isLoading, data, skeletonRows]);

  const columnOrder = React.useMemo(
    () => controlledColumnOrder ?? columns.map((col) => col.id),
    [controlledColumnOrder, columns],
  );

  const hasRowSelection =
    rowSelection !== undefined && onRowSelectionChange !== undefined;

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection: rowSelection ?? {},
      expanded,
      columnOrder,
    },
    getRowId,
    enableRowSelection: hasRowSelection,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange,
    onColumnVisibilityChange,
    onSortingChange,
    onExpandedChange,
    onColumnOrderChange,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      table.setColumnOrder((currentOrder) => {
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="bg-card rounded-md border">
        <TablePrimitive>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {hasRowSelection && (
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
                  {headerGroup.headers.map((header) => (
                    <TableHeadCell
                      header={header}
                      key={header.id}
                      reorder={reorder}
                    />
                  ))}
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
                    {hasRowSelection && (
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
                          <TableBodyCell cell={cell} />
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
        </TablePrimitive>
      </div>
    </DndContext>
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

const TableHeadCell = <TData,>({
  header,
  reorder,
}: {
  header: Header<TData, unknown>;
  reorder: boolean;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
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
        {reorder && header.column.columnDef.meta?.canReorder !== false && (
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

const TableBodyCell = <TData,>({ cell }: { cell: Cell<TData, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
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
