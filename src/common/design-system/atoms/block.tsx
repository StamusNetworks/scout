import { LucideIcon } from 'lucide-react';

import { cn } from '@/common/lib/utils';

import { Column } from './layout/column';
import { Row } from './layout/row';

export const BlockHeader = ({
  title,
  Icon,
  description,
  className,
}: {
  title: string;
  Icon?: LucideIcon;
  description?: string;
  className?: string;
}) => (
  <div className={cn('mb-2', className)}>
    <Row className="items-center gap-2">
      {Icon && <Icon size={20} />}
      <BlockTitle>{title}</BlockTitle>
    </Row>
    {description && <p className="text-xs">{description}</p>}
  </div>
);

export const BlockTitle = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <h1
    className={cn(
      'flex items-center text-sm font-bold [&>svg]:mr-1',
      className,
    )}
    onClick={onClick}
  >
    {children}
  </h1>
);

export const Block = ({
  title,
  Icon,
  description,
  className,
  children,
}: {
  title: string;
  Icon?: LucideIcon;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <Column className={cn('mb-2', className)}>
    <BlockHeader
      title={title}
      Icon={Icon}
      description={description}
    />
    {children}
  </Column>
);
