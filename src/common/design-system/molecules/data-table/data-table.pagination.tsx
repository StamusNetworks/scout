import { Table } from '@tanstack/react-table';

import { Pagination } from '../pagination';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <Pagination
      areSomeRowsSelected={table.getIsSomeRowsSelected()}
      selectedRowsCount={table.getFilteredSelectedRowModel().rows.length}
      rowsCount={table.getFilteredRowModel().rows.length}
      totalCount={table.getRowCount()}
      pageSize={table.getState().pagination.pageSize}
      pageIndex={table.getState().pagination.pageIndex}
      onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
      onPageIndexChange={(pageIndex) => table.setPageIndex(pageIndex)}
      isPreviousPage={table.getCanPreviousPage()}
      isNextPage={table.getCanNextPage()}
      pageCount={table.getPageCount()}
    />
  );
}
