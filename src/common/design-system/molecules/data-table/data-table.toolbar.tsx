import { cn } from '@/common/lib/utils';

import { Row } from '../../atoms/layout/row';

interface DataTableToolbarProps extends React.PropsWithChildren {
  className?: string;
}

export function DataTableToolbar({
  children,
  className,
}: DataTableToolbarProps) {
  return <Row className={cn('items-center gap-2', className)}>{children}</Row>;
}
