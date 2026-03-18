import { Info } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { cn } from '@/common/lib/utils';
import { Hostname } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { Roles } from '@/features/host-insights/use-cases/host-details/molecules/host-details/roles';
import { IpOrEntityEventValue } from '@/features/threats/common/molecules/ip-or-entity';

import { TimelineProps } from '../../models/threat-history.model';
import { useTimelineContext } from './timeline';
import { TimelineHostDetails } from './timeline.host-details';
import { TimelineKCPhaseBadge } from './timeline.kc-phase';
import { TimelineThreatB } from './timeline.threat';

export const TimelineRow = ({
  item,
  index,
  highlight,
}: {
  item: TimelineProps['entities'][0];
  index?: number;
  highlight?: boolean;
}) => {
  const { uniqueId, from_date, to_date } = useTimelineContext();
  const interval = to_date - from_date;
  return (
    <div
      className={cn(
        'border-border z-10 w-full border',
        index === 0 && 'border-t-2',
        highlight && 'bg-primary/5',
      )}
      key={item.entity}
      data-testid="timeline-row"
    >
      <Grid
        key={`${item.entity}-entity`}
        className="bg-muted/60 grid-cols-[150px_1fr] py-0.5"
      >
        <Dialog>
          <DialogTrigger className="flex items-center">
            <IpOrEntityEventValue
              entity={item.entity}
              offender={false}
              className={cn('px-1 text-left text-xs', highlight && 'font-bold')}
            />
            <Info className="text-muted-foreground ml-1 h-5 w-4" />
          </DialogTrigger>
          <DialogContent className="max-w-4xl px-1 pb-1">
            <TimelineHostDetails entity={item.entity} />
          </DialogContent>
        </Dialog>
        <Row
          id={`${uniqueId}-${item.entity}-timeline-kc-phases`}
          className="relative h-4 w-full overflow-x-clip"
        >
          {item.kc_phases.map((kc, i) => (
            <div
              key={kc.kc_phase + i}
              className="absolute h-4"
              style={{
                width: `${((kc.end_date - kc.start_date) / interval) * 100}%`,
                left: `${((kc.start_date - from_date) / interval) * 100}%`,
              }}
            >
              <TimelineKCPhaseBadge
                entity={item.entity}
                {...kc}
              />
            </div>
          ))}
        </Row>
      </Grid>
      <Grid
        key={`${item.entity}-threats`}
        className="grid-cols-[150px_1fr] py-1"
      >
        <Column className="mt-1 gap-1 px-1">
          <Hostname
            host={item.entity}
            size="small"
          />
          <Roles
            host={item.entity}
            className="grow-0 flex-wrap items-start justify-start"
          />
        </Column>
        <Column className="gap-1 overflow-x-clip">
          {item.threats.map((threat, i) => {
            return (
              <div
                className="relative h-4 w-full"
                key={threat.threat_id + i}
              >
                <div
                  className="absolute h-4"
                  style={{
                    width: `${((threat.end_date - threat.start_date) / interval) * 100}%`,
                    left: `${((threat.start_date - from_date) / interval) * 100}%`,
                  }}
                  id={`${uniqueId}-${item.entity}-timeline-threat-${threat.threat_id}`}
                >
                  <TimelineThreatB
                    {...threat}
                    index={index || 0}
                    entity={item.entity}
                  />
                </div>
              </div>
            );
          })}
        </Column>
      </Grid>
    </div>
  );
};
