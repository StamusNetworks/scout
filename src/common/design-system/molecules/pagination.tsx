import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

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
        {totalCount < 100 && (
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
