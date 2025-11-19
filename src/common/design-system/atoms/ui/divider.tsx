import { cn } from '@/common/lib/utils';

import { Row } from '../layout/row';

export const Divider = ({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) => {
  const styles = 'w-full grow h-px bg-border';

  return label ? (
    <Row className="w-full items-center gap-3">
      <span className={cn(styles, className)} />
      <span className="text-muted-foreground/80 shrink-0 text-sm">{label}</span>
      <span className={cn(styles, className)} />
    </Row>
  ) : (
    <div className={cn(styles, className)} />
  );
};
