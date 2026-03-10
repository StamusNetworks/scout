import { cva } from 'class-variance-authority';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';

import { killChainsConfig } from '../../killchain';

const clipPaths = {
  first:
    'polygon(0 0, calc(100% - 32px) 0, 100% 50%, calc(100% - 32px) 100%, 0 100%)',
  middle:
    'polygon(0 0, calc(100% - 32px) 0, 100% 50%, calc(100% - 32px) 100%, 0 100%, 32px 50%)',
  last: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 32px 50%)',
};

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
}) => {
  const isFirst = variant === 'reconnaissance';
  const isLast = variant === 'actions_on_objectives';
  const clipPath = isFirst
    ? clipPaths.first
    : isLast
      ? clipPaths.last
      : clipPaths.middle;

  return (
    <Column className="relative">
      <button
        className={cn(
          'relative flex h-16 cursor-pointer flex-col gap-1 p-2',
          value === 0 ? 'opacity-35' : 'opacity-100',
          className,
        )}
        onClick={() => onKCClick(variant)}
      >
        <div
          className={cn(
            'absolute inset-y-0',
            isFirst ? 'left-0' : '-left-[32px]',
            isLast ? 'right-0' : '-right-[32px]',
            kcBgVariants({ variant }),
          )}
          style={{ clipPath }}
        />
        <div
          className={cn(
            'relative z-10 flex h-full flex-col items-center justify-center text-center text-base font-medium',
            kcTextVariants({ variant }),
          )}
        >
          {isLoading ? <Spin /> : value}
        </div>
      </button>
    </Column>
  );
};

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

const kcBgVariants = cva('', {
  variants: {
    variant: {
      reconnaissance: 'bg-reconnaissance/65',
      weaponization: 'bg-weaponization/65',
      delivery: 'bg-delivery/65',
      exploitation: 'bg-exploitation/65',
      installation: 'bg-installation/65',
      command_and_control: 'bg-command_and_control/65',
      actions_on_objectives: 'bg-actions_on_objectives/65',
      pre_condition: 'bg-primary-700/50',
    },
  },
  defaultVariants: {
    variant: 'pre_condition',
  },
});

const kcTextVariants = cva('', {
  variants: {
    variant: {
      reconnaissance: 'text-reconnaissance-foreground',
      weaponization: 'text-weaponization-foreground',
      delivery: 'text-delivery-foreground',
      exploitation: 'text-exploitation-foreground',
      installation: 'text-installation-foreground',
      command_and_control: 'text-command_and_control-foreground',
      actions_on_objectives: 'text-actions_on_objectives-foreground',
      pre_condition: 'text-primary-950',
    },
  },
  defaultVariants: {
    variant: 'pre_condition',
  },
});
