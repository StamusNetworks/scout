import * as React from 'react';

import { cn } from '@/common/lib/utils';

import { ring } from '../ring';

export type InputProps = React.ComponentProps<'input'>;

const Input = ({ className, type, ...props }: InputProps) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        ring,
        'border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-0 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};

export { Input };
