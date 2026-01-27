import { Building2, Globe } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';

export function InternalExternal({
  external,
  className,
}: {
  external: boolean;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {external ? (
            <Globe className={className} />
          ) : (
            <Building2 className={className} />
          )}
        </TooltipTrigger>
        <TooltipContent>{external ? 'External' : 'Internal'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
