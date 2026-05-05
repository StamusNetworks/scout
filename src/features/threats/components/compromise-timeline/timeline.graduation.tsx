import { format } from 'date-fns';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';

import { useTimelineContext } from './compromise-timeline';

export const TimelineGraduation = () => {
  const { from_date, to_date } = useTimelineContext();
  const interval = to_date - from_date;
  return (
    <Grid className="mt-2 grid-cols-[150px_repeat(10,1fr)] gap-2">
      <div />
      {Array.from({ length: 10 }).map((_, i) => {
        const tick = new Date(from_date + (i * interval) / 10);
        return (
          <Column key={i}>
            <p className="text-muted-foreground mb-1 w-fit -translate-x-1/2 text-xs">
              {tick.toLocaleDateString()}
            </p>
            <p className="text-muted-foreground mb-1 w-fit -translate-x-1/2 text-xs">
              {format(tick, 'HH:mm:ss')}
            </p>
            <span className="bg-border h-1 w-0.5" />
          </Column>
        );
      })}
    </Grid>
  );
};
