import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/common/design-system/molecules/tooltip';
import { compressIPv6 } from '@/common/lib/ips';
import { useThreat } from '@/features/threats/hooks/use-threat';

import { type TimelineThreat } from '../../model/threat-history';
import { useTimelineContext } from './compromise-timeline';

export const TimelineThreatB = ({
  threat_id,
  start_date,
  end_date,
  entity,
  type,
}: TimelineThreat & { entity: string; index: number }) => {
  const { uniqueId } = useTimelineContext();
  const navigate = useNavigate();
  const { data: threat, isLoading } = useThreat(parseInt(threat_id));

  return (
    <Tooltip>
      <TooltipTrigger className="z-10 h-full w-full">
        <Badge
          className="rounded-fulls flex h-full w-full justify-normal px-0 py-0 text-left text-[0.7rem] whitespace-nowrap"
          variant={
            type === 'offender'
              ? 'offender'
              : type === 'dopv'
                ? 'policy_violation'
                : 'victim'
          }
          id={`${uniqueId}-${entity}-${threat_id}`}
          onClick={() =>
            navigate({
              to: `${type === 'dopv' ? '/policy-violations' : '/threats'}/coverage/threat/${threat_id}`,
            })
          }
        >
          {isLoading ? (
            <Spin className="ml-2 h-2 w-2 animate-spin" />
          ) : (
            <span className="ml-2">{threat?.name}</span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-60">
        <h2 className="text-sm font-bold">{compressIPv6(entity)}</h2>
        <p>{threat?.name}</p>
        <Grid className="my-1 grid-cols-[min-content_1fr] gap-x-1">
          <p>from: </p>
          <p>{format(new Date(start_date), 'yyyy-MM-dd HH:mm:ss')}</p>
          <p>to: </p>
          <p>{format(new Date(end_date), 'yyyy-MM-dd HH:mm:ss')}</p>
        </Grid>
        <p>{threat?.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};
