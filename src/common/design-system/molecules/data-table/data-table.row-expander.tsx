import { Row } from '@tanstack/react-table';

import { Button } from '../../atoms/ui/button';

interface DataTableRowExpanderProps<T> {
  row: Row<T>;
}

export function DataTableRowExpander<T>({ row }: DataTableRowExpanderProps<T>) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        row.toggleExpanded();
      }}
      className="h-5 w-5 select-none"
      variant="outline"
      size="icon"
    >
      <span className="-translate-y-px">{row.getIsExpanded() ? '-' : '+'}</span>
    </Button>
  );
}
