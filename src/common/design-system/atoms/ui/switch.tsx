import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/common/lib/utils';

import { ring } from '../ring';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    className?: string;
    size?: 'sm' | 'md';
  }
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      ring,
      switchVariants({ size }),
      props.disabled && 'data-[state=checked]:bg-muted-foreground',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={switchThumbVariants({ size })} />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus-visible:border-transparent shadow-xs transition-colors  disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        md: 'h-5 w-9',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        sm: 'size-3',
        md: 'size-4 data-[state=checked]:translate-x-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export { Switch };
