import { Grid } from '@/common/design-system/atoms/layout/grid';
import { cn } from '@/common/lib/utils';

export const ThreatGrid = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <Grid
      className={cn(
        'grid-cols-2 gap-3 @3xl/app:grid-cols-3 @6xl/app:grid-cols-4',
        className,
      )}
    >
      {children}
    </Grid>
  );
};
