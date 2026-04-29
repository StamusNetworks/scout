import { ComponentPropsWithoutRef } from 'react';

import { DropdownMenuItem } from '@/common/design-system/atoms/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';

type TooltipMenuItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuItem
> & {
  tooltip?: string;
};

export const TooltipMenuItem = ({
  disabled,
  tooltip,
  children,
  ...rest
}: TooltipMenuItemProps) => {
  const showTooltip = Boolean(disabled && tooltip);
  return (
    <Tooltip>
      {/* span keeps hover events fire-able when the radix item has pointer-events: none */}
      <TooltipTrigger asChild>
        <span className="block">
          <DropdownMenuItem
            disabled={disabled}
            aria-description={disabled ? tooltip : undefined}
            {...rest}
          >
            {children}
          </DropdownMenuItem>
        </span>
      </TooltipTrigger>
      {showTooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  );
};
