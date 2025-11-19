import * as React from 'react';

import { cn } from '@/common/lib/utils';

import { ring } from '../ring';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        ring,
        'border-input placeholder:text-muted-foreground flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
