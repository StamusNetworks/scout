import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/common/lib/utils';

import { ring } from '../ring';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const buttonVariants = cva(
  'border cursor-pointer inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-primary text-primary-foreground dark:bg-gradient-to-t bg-gradient-to-b from-primary/70 dark:from-primary/80 to-primary hover:from-primary/80 px-4 shadow-[inset_0_1px_0px_0px_rgba(255,255,255,0.3),0_2px_5px_0px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.2),0_2px_5px_0px_rgba(255,255,255,0.3)]  dark:hover:from-primary hover:to-primary active:[box-shadow:none] outline-1 outline-background/80',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 border-destructive',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-foreground/5 dark:hover:border-foreground/20',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 border-secondary',
        ghost:
          'hover:bg-accent hover:text-accent-foreground border-transparent',
        link: 'text-primary underline-offset-4 hover:underline border-transparent',
        ghostIcon:
          'text-foreground/50 hover:text-foreground p-0.5 border-transparent',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: 'h-6 px-2 text-xs [&_svg]:size-3 has-[>svg]:px-1.5',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': 'size-6',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
        none: '',
      },
      textColor: {
        default: '',
        destructive: 'text-destructive',
      },
      highlight: {
        true: 'outline-none ring-2 ring-ring ring-offset-2 ring-offset-background shadow-lg shadow-primary/30',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      textColor: 'default',
      highlight: false,
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  disabledTooltip?: string;
  role?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      textColor,
      highlight,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return props.disabled && props.disabledTooltip ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className={props.disabled && 'cursor-not-allowed'}>
            <Comp
              className={cn(
                ring,
                buttonVariants({
                  variant,
                  size,
                  textColor,
                  highlight,
                  className,
                }),
              )}
              ref={ref}
              {...props}
            />
          </TooltipTrigger>
          <TooltipContent className="w-fit max-w-[250px]">
            <p className="text-xs">{props.disabledTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <Comp
        className={cn(
          ring,
          buttonVariants({ variant, size, textColor, highlight, className }),
          props.disabled && 'cursor-not-allowed',
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
