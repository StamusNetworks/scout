import { format } from 'date-fns';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/common/design-system/molecules/tooltip';

import { KillChainPhase, killChainsConfig } from '@/features/threats/common/killchain/killchain';
import { TimelineKCPhase } from '../../models/threat-history.model';

export const TimelineKCPhaseBadge = ({
  entity,
  start_date,
  end_date,
  kc_phase,
}: TimelineKCPhase & { entity: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger className="h-full w-full -translate-y-[2px]">
        <Badge
          className="block h-full rounded-none px-0"
          variant={kc_phase as KillChainPhase}
        />
      </TooltipTrigger>
      <TooltipContent>
        <h2 className="text-sm font-bold">{entity}</h2>
        <p className="mb-0.5 italic">{killChainsConfig[kc_phase].name}</p>
        <Grid className="grid-cols-[min-content_1fr] gap-x-1">
          <p>from: </p>
          <p>{format(new Date(start_date), 'yyyy-MM-dd HH:mm:ss')}</p>
          <p>to: </p>
          <p>{format(new Date(end_date), 'yyyy-MM-dd HH:mm:ss')}</p>
        </Grid>
      </TooltipContent>
    </Tooltip>
  );
};
