import { Column } from '@/common/design-system/atoms/layout/column';
import { cn } from '@/common/lib/utils';

interface CategoryProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const Category = ({ children, className }: CategoryProps) => (
  <div className={cn('', className)}>{children}</div>
);

interface CategoryHeaderProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const CategoryHeader = ({
  children,
  className,
}: CategoryHeaderProps) => (
  <Column className={cn('mb-2', className)}>{children}</Column>
);

interface CategoryTitleProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const CategoryTitle = ({ children, className }: CategoryTitleProps) => (
  <h3 className={cn('text-sm font-bold', className)}>{children}</h3>
);

interface CategoryDescriptionProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const CategoryDescription = ({
  children,
  className,
}: CategoryDescriptionProps) => (
  <p className={cn('text-muted-foreground max-w-lg text-sm', className)}>
    {children}
  </p>
);

export const CategoryContent = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="grid grid-cols-2 gap-16">{children}</div>;

interface FieldTitleProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const FieldTitle = ({ children, className }: FieldTitleProps) => (
  <label className={cn('text-sm font-medium', className)}>{children}</label>
);

interface FieldDescriptionProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const FieldDescription = ({
  className,
  children,
}: FieldDescriptionProps) => (
  <p className={cn('text-muted-foreground mb-2 text-xs', className)}>
    {children}
  </p>
);
