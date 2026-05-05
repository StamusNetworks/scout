import { Biohazard } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/common/design-system/molecules/tooltip';
import { compressIPv6 } from '@/common/lib/ips';
import { cn } from '@/common/lib/utils';
import { useThreat } from '@/features/threats/common/hooks/use-threat';

import { MENU_WIDTH, useTimelineContext } from './compromise-timeline';

interface TimelineLateralMovementProps {
  timelineRef: React.RefObject<HTMLDivElement | null>;
  victim: string;
  offender: string;
  threat_id: string;
}

export const TimelineLateralMovement = ({
  timelineRef,
  victim,
  offender,
  threat_id,
}: TimelineLateralMovementProps) => {
  const { uniqueId, from_date, to_date } = useTimelineContext();
  const { data: threat } = useThreat(parseInt(threat_id));

  const [position, setPosition] = useState<{
    x: number;
    height: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const victimThreat = document.getElementById(
      `${uniqueId}-${victim}-${threat_id}`,
    );
    const offenderElement = document.getElementById(
      `${uniqueId}-${offender}-timeline-kc-phases`,
    );

    if (!victimThreat || !offenderElement) return;

    const victimRect = victimThreat.getBoundingClientRect();
    const offenderRect = offenderElement.getBoundingClientRect();
    const timelineRect = timelineRef.current?.getBoundingClientRect();

    if (!timelineRect) return;

    // Calculate height based on distance between victim and offender
    const height = offenderRect.top - victimRect.top;
    // Calculate X offset relative to the timeline
    const xOffset = victimRect.left - timelineRect.left - MENU_WIDTH;
    const yOffset =
      (height < 0 ? offenderRect.top : victimRect.top) - timelineRect.top;

    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setPosition({
      x: xOffset,
      height: height,
      y: yOffset,
    });
  }, [victim, offender, threat_id, timelineRef, from_date, to_date, uniqueId]);

  if (!position) return null;

  return (
    <div
      style={{
        left: position.x,
        top: position.y - 2,
        height: Math.abs(position.height),
      }}
      className="absolute z-20 w-[3px]"
    >
      <Tooltip placement="left">
        <TooltipTrigger className="h-full w-full">
          <div className="h-full w-full -translate-x-px translate-y-[0.8rem] border-red-600 bg-red-500/30">
            <div
              className={cn(
                'absolute left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-500 shadow-sm shadow-red-500',
                position.height < 0
                  ? 'animate-lateral-movement'
                  : 'animate-lateral-movement-reverse',
              )}
            />
            <div
              className={cn(
                'absolute bottom-0 h-1 w-1 rounded-full bg-red-500 shadow-sm shadow-red-500',
                position.height < 0 ? 'bottom-0' : '-top-1',
              )}
            />
            <Biohazard
              className={cn(
                'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600',
                position.height < 0 ? '-top-0.5' : '-bottom-3',
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <h2 className="text-sm font-bold">{compressIPv6(victim)}</h2>
          <p className="mb-0.5">{threat?.name}</p>
          <Grid className="grid-cols-[min-content_1fr] gap-x-1">
            <p>offender: </p>
            <p>{compressIPv6(offender)}</p>
          </Grid>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
