import { cn } from '@/common/lib/utils';

type GridProps = React.HTMLAttributes<HTMLDivElement>;

export const Grid = ({ className, children, ...props }: GridProps) => {
  return (
    <div
      className={cn('grid', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';
