import React from 'react';

import { cn } from '@/common/lib/utils';

export const PageHeader = ({
  title,
  description,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    {typeof title === 'string' ? <PageTitle>{title}</PageTitle> : title}
    <div
      className={cn(
        'text-foreground/70 text-sm',
        typeof description === 'string' && 'max-w-xl',
      )}
    >
      {description}
    </div>
  </div>
);

export const PageTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <h1 className={cn('mb-1 text-xl font-bold', className)}>{children}</h1>;
