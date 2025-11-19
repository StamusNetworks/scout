import { Badge } from '@/common/design-system/atoms/ui/badge';
import { formatNumber } from '@/common/lib/numbers';
import { cn } from '@/common/lib/utils';

export const FormattedBadge = ({
  variant,
  className,
  value,
}: {
  variant?: 'default' | 'secondary';
  className?: string;
  value: number | string;
}) => {
  const number = typeof value === 'string' ? parseInt(value, 10) : value;
  return (
    <Badge
      className={cn('text-nowrap', className)}
      variant={variant}
    >
      {formatNumber(number)}
    </Badge>
  );
};
