import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { createContext, use } from 'react';

import { cn } from '@/common/lib/utils';

import { Button } from '../atoms/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../atoms/ui/select';

interface PaginationProps {
  areSomeRowsSelected: boolean;
  selectedRowsCount: number;
  rowsCount: number;
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  onPageSizeChange: (pageSize: number) => void;
  onPageIndexChange: (pageIndex: number) => void;
  isPreviousPage: boolean;
  isNextPage: boolean;
  pageCount: number;
}
export const Pagination = ({
  areSomeRowsSelected,
  selectedRowsCount,
  rowsCount,
  totalCount,
  pageSize,
  pageIndex,
  onPageSizeChange,
  onPageIndexChange,
  isPreviousPage,
  isNextPage,
  pageCount,
}: PaginationProps) => (
  <div className="flex items-center justify-between gap-4 px-2">
    {areSomeRowsSelected ? (
      <div className="text-muted-foreground flex-1 text-sm">
        {selectedRowsCount} of {rowsCount} row(s) selected.
      </div>
    ) : (
      <div className="text-muted-foreground flex-1 text-sm">
        Total items count: {totalCount}
      </div>
    )}
    <div className="flex items-center space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            onPageSizeChange(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem
                key={pageSize}
                value={`${pageSize}`}
              >
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageIndexChange(0)}
          disabled={!isPreviousPage}
          size="icon"
        >
          <span className="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageIndexChange(pageIndex - 1)}
          disabled={!isPreviousPage}
          size="icon"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        {pageCount < 100 && (
          <Select
            value={pageIndex.toString()}
            onValueChange={(val) => onPageIndexChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-fit">
              <SelectValue />
              <span className="w-1.5" />
            </SelectTrigger>
            <SelectContent side="top">
              {Array.from({ length: pageCount }).map((_, i) => (
                <SelectItem
                  key={i}
                  value={i.toString()}
                >
                  {(i + 1).toString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageIndexChange(pageIndex + 1)}
          disabled={!isNextPage}
          size="icon"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageIndexChange(pageCount - 1)}
          disabled={!isNextPage}
          size="icon"
        >
          <span className="sr-only">Go to last page</span>
          <DoubleArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

const PaginationContext = createContext<PaginationProps>({
  areSomeRowsSelected: false,
  selectedRowsCount: 0,
  rowsCount: 0,
  totalCount: 0,
  pageSize: 10,
  pageIndex: 0,
  onPageSizeChange: () => {},
  onPageIndexChange: () => {},
  isPreviousPage: false,
  isNextPage: false,
  pageCount: 0,
});

export const ComposablePagination = ({
  areSomeRowsSelected,
  selectedRowsCount,
  rowsCount,
  totalCount,
  pageSize,
  pageIndex,
  onPageSizeChange,
  onPageIndexChange,
  isPreviousPage,
  isNextPage,
  pageCount,
  children,
  className,
}: React.PropsWithChildren<PaginationProps> & {
  className?: string;
}) => {
  return (
    <PaginationContext.Provider
      value={{
        areSomeRowsSelected,
        selectedRowsCount,
        rowsCount,
        totalCount,
        pageSize,
        pageIndex,
        onPageSizeChange,
        onPageIndexChange,
        isPreviousPage,
        isNextPage,
        pageCount,
      }}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-4 px-2',
          className,
        )}
      >
        {children}
      </div>
    </PaginationContext.Provider>
  );
};

export const usePagination = () => {
  const context = use(PaginationContext);
  if (!context) {
    throw new Error('usePagination must be used within a ComposablePagination');
  }
  return context;
};

export const ItemsCount = () => {
  const { totalCount, areSomeRowsSelected, selectedRowsCount, rowsCount } =
    usePagination();
  return areSomeRowsSelected ? (
    <div className="text-muted-foreground flex-1 text-sm">
      {selectedRowsCount} of {rowsCount} row(s) selected.
    </div>
  ) : (
    <div className="text-muted-foreground flex-1 text-sm">
      Total items count: {totalCount}
    </div>
  );
};

export const PageOptions = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={cn('flex items-center space-x-6 lg:space-x-8', className)}>
      {children}
    </div>
  );
};

export const RowsPerPage = () => {
  const { pageSize, onPageSizeChange } = usePagination();
  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">Rows per page</p>
      <Select
        value={`${pageSize}`}
        onValueChange={(value) => {
          onPageSizeChange(Number(value));
        }}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent side="top">
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <SelectItem
              key={pageSize}
              value={`${pageSize}`}
            >
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const PageSelector = () => {
  const {
    pageIndex,
    pageCount,
    onPageIndexChange,
    isPreviousPage,
    isNextPage,
  } = usePagination();
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        className="hidden h-8 w-8 p-0 lg:flex"
        onClick={() => onPageIndexChange(0)}
        disabled={!isPreviousPage}
        size="icon"
      >
        <span className="sr-only">Go to first page</span>
        <DoubleArrowLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => onPageIndexChange(pageIndex - 1)}
        disabled={!isPreviousPage}
        size="icon"
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      {pageCount < 100 && (
        <Select
          value={pageIndex.toString()}
          onValueChange={(val) => onPageIndexChange(Number(val))}
        >
          <SelectTrigger className="h-8 w-fit">
            <SelectValue />
            <span className="w-1.5" />
          </SelectTrigger>
          <SelectContent side="top">
            {Array.from({ length: pageCount }).map((_, i) => (
              <SelectItem
                key={i}
                value={i.toString()}
              >
                {(i + 1).toString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => onPageIndexChange(pageIndex + 1)}
        disabled={!isNextPage}
        size="icon"
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="hidden h-8 w-8 p-0 lg:flex"
        onClick={() => onPageIndexChange(pageCount - 1)}
        disabled={!isNextPage}
        size="icon"
      >
        <span className="sr-only">Go to last page</span>
        <DoubleArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
