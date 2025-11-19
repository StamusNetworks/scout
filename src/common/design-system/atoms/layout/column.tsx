import React from 'react';

import { cn } from '@/common/lib/utils';

type ColumnProps = React.HTMLAttributes<HTMLDivElement>;

export const Column = React.forwardRef<HTMLDivElement, ColumnProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Column.displayName = 'Column';
