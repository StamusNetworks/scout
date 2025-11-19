import { cn } from '@/common/lib/utils';

type RowProps = React.HTMLAttributes<HTMLDivElement>;

export const Row = ({ className, children, ...props }: RowProps) => {
  return (
    <div
      className={cn('flex flex-row', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Row.displayName = 'Row';
