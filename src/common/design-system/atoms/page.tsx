import { LucideIcon } from 'lucide-react';

import { cn } from '@/common/lib/utils';

import { Column } from './layout/column';
import { Container } from './layout/container';
import { Row } from './layout/row';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';

type PageProps = React.ComponentProps<typeof ScrollArea>;
export const Page = ({ children }: PageProps) => (
  <ScrollArea
    className="h-full w-full overflow-clip"
    type="scroll"
  >
    {children}
  </ScrollArea>
);

type PageContainerProps = React.ComponentProps<typeof Container>;
export const PageContainer = ({
  children,
  className,
  ...rest
}: PageContainerProps) => (
  <Container
    className={cn('@container/app py-5 pb-[75px]', className)}
    {...rest}
  >
    {children}
  </Container>
);

interface PageHeaderProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const PageHeader = ({ children }: PageHeaderProps) => (
  <Row className="mb-4 justify-between gap-4">{children}</Row>
);

interface PageAlertProps extends React.ComponentProps<typeof Alert> {
  Icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}
export const PageAlert = ({
  Icon,
  title,
  description,
  className,
  variant = 'primary',
  ...rest
}: PageAlertProps) => (
  <Alert
    className={cn('mb-3 w-full', className)}
    variant={variant}
    {...rest}
  >
    <Icon />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
);

type PageContentProps = React.ComponentProps<typeof Column>;
export const PageHeaderContent = ({ children }: PageContentProps) => (
  <Column className="grow">{children}</Column>
);

type PageActionsProps = React.ComponentProps<typeof Row>;
export const PageActions = ({ children }: PageActionsProps) => (
  <Row className="gap-2">{children}</Row>
);

interface PageTitleProps
  extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}
export const PageTitle = ({ className, children, slot }: PageTitleProps) => (
  <Row className={cn('mb-1 items-center gap-2', className)}>
    <h1 className="text-xl font-bold">{children}</h1>
    {slot}
  </Row>
);

type PageDescriptionProps = React.HTMLAttributes<HTMLDivElement>;
export const PageDescription = ({
  children,
  className,
  ...rest
}: PageDescriptionProps) => (
  <div
    className={cn('text-foreground/70 mb-2 max-w-2xl text-sm', className)}
    {...rest}
  >
    {children}
  </div>
);

type PageStatsProps = React.ComponentProps<typeof Column>;
export const PageStats = ({ children, className, ...rest }: PageStatsProps) => (
  <Row
    className={cn('gap-4', className)}
    {...rest}
  >
    {children}
  </Row>
);

interface PageStatProps extends React.ComponentProps<typeof Column> {
  label: string;
  value: React.ReactNode | undefined;
}
export const PageStat = ({
  label,
  value,
  className,
  ...rest
}: PageStatProps) => (
  <Column
    className={className}
    {...rest}
  >
    <h3 className="text-foreground/50 mb-1 text-xs font-bold">{label}</h3>
    <div className="text-sm break-all">{value ?? 'n/a'}</div>
  </Column>
);
