import { Pagination } from '../pagination';

export interface PaginationFooterProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationFooter({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationFooterProps) {
  const pageCount = Math.ceil(total / pageSize);
  const pageIndex = page - 1;

  return (
    <Pagination
      areSomeRowsSelected={false}
      selectedRowsCount={0}
      rowsCount={Math.min(pageSize, total - pageIndex * pageSize)}
      totalCount={total}
      pageSize={pageSize}
      pageIndex={pageIndex}
      onPageSizeChange={onPageSizeChange}
      onPageIndexChange={(idx) => onPageChange(idx + 1)}
      isPreviousPage={pageIndex > 0}
      isNextPage={page < pageCount}
      pageCount={pageCount}
    />
  );
}
