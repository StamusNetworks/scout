import { cn } from '@/common/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      {...props}
      data-testid="skeleton"
    />
  );
}

export { Skeleton };
