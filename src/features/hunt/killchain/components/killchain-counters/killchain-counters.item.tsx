import { cva } from 'class-variance-authority';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';

import { killChainsConfig } from '../../killchain';

export const KCItem = ({
  value,
  variant,
  className,
  onKCClick,
  isLoading,
}: {
  value: number;
  variant:
    | 'reconnaissance'
    | 'weaponization'
    | 'delivery'
    | 'exploitation'
    | 'installation'
    | 'command_and_control'
    | 'actions_on_objectives'
    | 'pre_condition';
  onKCClick: (killchain: keyof typeof killChainsConfig) => void;
  className?: string;
  isLoading?: boolean;
}) => (
  <Column className="relative">
    <button
      className={cn(kcitemVariants({ variant, empty: value === 0 }), className)}
      onClick={() => onKCClick(variant)}
    >
      <div className="flex h-full flex-col items-center justify-center text-center text-base font-medium">
        {isLoading ? <Spin /> : value}
      </div>
    </button>
  </Column>
);

export const KCTitle = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => (
  <p
    className={cn(
      'text-foreground flex h-full flex-col items-center justify-center text-center text-xs',
      className,
    )}
  >
    {value}
  </p>
);

const kcitemVariants = cva(
  'cursor-pointer relative flex flex-col gap-1 p-2 h-16 before:absolute before:w-0 before:h-0 before:-left-[32px] before:top-0  before:border-t-32 before:border-l-32 before:border-b-32 before:border-l-transparent before:border-r-0 after:absolute after:w-0 after:h-0 after:-right-[32px] after:top-0  after:border-t-32 after:border-l-32 after:border-b-32 after:border-transparent',
  {
    variants: {
      variant: {
        reconnaissance:
          'bg-reconnaissance/65 text-reconnaissance-foreground before:hidden after:border-l-reconnaissance/65',
        weaponization:
          'bg-weaponization/65 text-weaponization-foreground before:border-t-weaponization/65 before:border-b-weaponization/65 after:border-l-weaponization/65',
        delivery:
          'bg-delivery/65 text-delivery-foreground before:border-t-delivery/65 before:border-b-delivery/65 after:border-l-delivery/65',
        exploitation:
          'bg-exploitation/65 text-exploitation-foreground before:border-t-exploitation/65 before:border-b-exploitation/65 after:border-l-exploitation/65',
        installation:
          'bg-installation/65 text-installation-foreground before:border-t-installation/65 before:border-b-installation/65 after:border-l-installation/65',
        command_and_control:
          'bg-command_and_control/65 text-command_and_control-foreground before:border-t-command_and_control/65 before:border-b-command_and_control/65 after:border-l-command_and_control/65',
        actions_on_objectives:
          'bg-action_on_objectives/65 text-action_on_objectives-foreground before:border-t-action_on_objectives/65 before:border-b-action_on_objectives/65',
        pre_condition:
          'bg-primary-700/50 text-primary-950 before:border-t-primary-700/50 before:border-b-primary-700/50 after:border-l-primary-700/50',
      },
      empty: {
        true: 'opacity-35',
        false: 'opacity-100',
      },
    },
    defaultVariants: {
      variant: 'pre_condition',
      empty: true,
    },
  },
);
