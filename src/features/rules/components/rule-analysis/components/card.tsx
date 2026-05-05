import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { cn } from '@/common/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const Card = ({ children, className }: CardProps) => (
  <Column
    className={cn('border-border bg-card rounded-md border p-3', className)}
  >
    {children}
  </Column>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const CardTitle = ({ children, className }: CardTitleProps) => (
  <Row className={cn('mb-2 flex-wrap', className)}>{children}</Row>
);

interface CardNameProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}
export const CardName = ({ children, className }: CardNameProps) => (
  <h3 className={cn('font-medium', className)}>{children}</h3>
);

interface EngineMatches extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const EngineMatches = ({ children, className }: EngineMatches) => (
  <Column className={cn('gap-2', className)}>{children}</Column>
);
