import { Building2, Globe } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';

export function InternalExternal({
  internal,
  className,
}: {
  internal: boolean;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {internal ? (
            <Building2 className={className} />
          ) : (
            <Globe className={className} />
          )}
        </TooltipTrigger>
        <TooltipContent>{internal ? 'Internal' : 'External'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
