import { Inbox } from 'lucide-react';

import { cn } from '@/common/lib/utils';

import { Column } from '../../atoms/layout/column';

interface EmptyProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const Empty = ({ className, children, ...props }: EmptyProps) => {
  return (
    <Column
      className={cn('items-center justify-center', className)}
      {...props}
    >
      <div className="border-border mb-4 flex items-center justify-center rounded-full border p-6">
        <Inbox className="text-primary size-12" />
      </div>
      {children || "There's nothing to display"}
    </Column>
  );
};
