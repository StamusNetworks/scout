import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/common/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        discreet: 'border-transparent bg-primary/15 text-foreground',
        muted: 'bg-muted text-muted-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-sm',
        outline: 'text-foreground',
        victim: 'bg-doc/20 text-doc-foreground border-doc-foreground/25 w-fit',
        offender:
          'bg-doc-offender/20 text-doc-offender-foreground border-doc-offender-foreground/25 w-fit',
        policy_violation:
          'bg-dopv/20 text-dopv-foreground border-dopv-foreground/25 w-fit',
        pre_condition: 'bg-primary-700/50 text-primary-950 border-primary-900 ',
        reconnaissance:
          'bg-reconnaissance/15 dark:bg-reconnaissance/25 text-reconnaissance-foreground/70 border-reconnaissance-foreground/30',
        weaponization:
          'bg-weaponization/15 dark:bg-weaponization/25 text-weaponization-foreground/70 border-weaponization-foreground/30 ',
        delivery:
          'bg-delivery/15 dark:bg-delivery/25 text-delivery-foreground/70 border-delivery-foreground/30 ',
        exploitation:
          'bg-exploitation/15 dark:bg-exploitation/25 text-exploitation-foreground/70 border-exploitation-foreground/30 ',
        installation:
          'bg-installation/15 dark:bg-installation/25 text-installation-foreground/70 border-installation-foreground/30 ',
        command_and_control:
          'bg-command_and_control/15 dark:bg-command_and_control/25 text-command_and_control-foreground/70 border-command_and_control-foreground/30 ',
        actions_on_objectives:
          'bg-action_on_objectives/15 dark:bg-action_on_objectives/25 text-action_on_objectives-foreground/70 border-action_on_objectives-foreground/30 ',
        notification:
          'bg-red-500 text-red-100 border-red-500/30 rounded-full size-4 text-[0.7rem] p-0',
      },
      rounded: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant,
  rounded,
  ...props
}: BadgeProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn(badgeVariants({ variant, rounded }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
