import { cn } from '@/common/lib/utils';

export function TitleRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-end justify-between gap-3 border-b px-2 py-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TitleRowStart({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-end gap-3', className)}>{children}</div>
  );
}

export function TitleRowEnd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-end gap-3', className)}>{children}</div>
  );
}

export function TitleRowTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('text-sm font-semibold', className)}>{children}</span>
  );
}
