import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/common/design-system/molecules/tooltip';
import { useThreat } from '@/features/hunt/threats/hooks/use-threat';
import { routes } from '@/pages/routes.config';

import { type TimelineThreat } from '../../models/threat-history.model';
import { useTimelineContext } from './timeline';

export const TimelineThreatB = ({
  threat_id,
  start_date,
  end_date,
  entity: entity,
  type,
}: TimelineThreat & { entity: string; index: number }) => {
  const { uniqueId } = useTimelineContext();
  const navigate = useNavigate();
  const { data: threat, isLoading } = useThreat(parseInt(threat_id));

  return (
    <Tooltip>
      <TooltipTrigger className="z-10 h-full w-full">
        <Badge
          className="rounded-fulls flex h-full w-full -translate-y-1 justify-normal px-0 py-0 text-left text-[0.7rem] whitespace-nowrap"
          variant={type === 'doc' ? 'victim' : 'policy_violation'}
          id={`${uniqueId}-${entity}-${threat_id}`}
          onClick={() =>
            navigate(
              (type === 'doc'
                ? routes.threats_coverage_threat
                : routes.policy_violations_coverage_threat
              ).replace(':threatId', threat_id),
            )
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
        <h2 className="text-sm font-bold">{entity}</h2>
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
