import { cn } from '@/common/lib/utils';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const Container = ({
  className,
  children,
  ...props
}: ContainerProps) => {
  return (
    <div
      className={cn('container mx-auto', className)}
      {...props}
      data-testid="container-content"
    >
      {children}
    </div>
  );
};

Container.displayName = 'Container';
