import { toPairs } from 'ramda';
import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { cn } from '@/common/lib/utils';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import {
  useGetOffendersQuery,
  useGetThreatHistoryQuery,
} from '../../api/timeline.api';
import {
  formatThreatHistory,
  getOffenders,
} from '../../model/format-threat-history';
import { TimelineProps } from '../../model/threat-history';
import { TimelineControls } from './timeline.controls';
import { TimelineGraduation } from './timeline.graduation';
import { TimelineHelpButton } from './timeline.help';
import { TimelineLateralMovement } from './timeline.lateral-movement';
import { TimelineRow } from './timeline.row';
import { TimelineZoomToFit } from './timeline.zoom-to-fit';

export const MENU_WIDTH = 150;

export const CompromiseTimeline = ({ entity }: { entity?: string }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data, isLoading } = useGetThreatHistoryQuery(params);
  const { data: offendersData } = useGetOffendersQuery(params);

  const timelineProps = useMemo(() => {
    if (!data?.results.length || !offendersData) return null;

    const internalEntities = [...new Set(data?.results.map((t) => t.asset))];

    return {
      ...formatThreatHistory(data?.results),
      lateralMovements: getOffenders(offendersData, internalEntities),
      entity,
    };
  }, [entity, data, offendersData]);

  if (isLoading) return <div>Loading...</div>;
  if (!timelineProps) return <div>No data</div>;

  return (
    <TimelineProvider
      start_date={timelineProps.start_date}
      end_date={timelineProps.end_date}
    >
      <CompromiseTimelineTemplate {...timelineProps} />
    </TimelineProvider>
  );
};

export const CompromiseTimelineTemplate = ({
  start_date,
  end_date,
  entities,
  lateralMovements,
  entity,
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<'grabbing' | 'grab' | 'default'>(
    'default',
  );
  const formattedMovements = useMemo(
    () =>
      toPairs(lateralMovements)
        .map(([victim, movements]) => ({
          victim,
          movements,
        }))
        .filter((mov) =>
          entity
            ? mov.victim === entity ||
              mov.movements.some((m) => m.offender_ip === entity)
            : true,
        ),
    [lateralMovements, entity],
  );
  return (
    <Column>
      <Row className="justify-end gap-2">
        <TimelineZoomToFit
          start_date={start_date}
          end_date={end_date}
        />
        <TimelineHelpButton />
      </Row>
      <Column
        className={cn(
          'relative overflow-hidden',
          cursor === 'grabbing'
            ? 'cursor-grabbing *:pointer-events-none'
            : cursor === 'grab'
              ? 'cursor-grab'
              : 'cursor-default',
        )}
        ref={ref}
      >
        <div className="bg-border absolute top-[52px] left-[150px] z-0 h-[calc(100%-52px)] w-px" />
        <TimelineGraduation />
        <TimelineControls
          timelineRef={ref}
          setCursor={setCursor}
        />
        {entities
          .filter((a) =>
            entity
              ? a.entity === entity ||
                lateralMovements[entity]
                  ?.map((o) => o.offender_ip)
                  .includes(a.entity) ||
                lateralMovements[a.entity]
                  ?.map((o) => o.offender_ip)
                  .includes(entity)
              : true,
          )
          .map((item, index) => (
            <TimelineRow
              key={item.entity}
              item={item}
              index={index}
              highlight={item.entity === entity}
            />
          ))}
        <Grid className="absolute inset-0 grid-cols-[150px_1fr]">
          <div />
          <div className="relative overflow-hidden">
            {formattedMovements.map(({ victim, movements }) =>
              movements.map((movement) => (
                <TimelineLateralMovement
                  timelineRef={ref}
                  victim={victim}
                  offender={movement.offender_ip}
                  threat_id={movement.threat_id}
                  key={`${victim}-${movement.offender_ip}-${movement.threat_id}`}
                />
              )),
            )}
          </div>
        </Grid>
      </Column>
    </Column>
  );
};

const TimelineContext = createContext<
  | {
      uniqueId: string;
      from_date: number;
      to_date: number;
      setFromDate: (date: number) => void;
      setToDate: (date: number) => void;
    }
  | undefined
>(undefined);

const TimelineProvider = ({
  start_date,
  end_date,
  children,
}: {
  start_date: number;
  end_date: number;
  children: React.ReactNode;
}) => {
  const [uniqueId] = useState(() => uuidv4());
  const [from_date, setFromDate] = useState(start_date);
  const [to_date, setToDate] = useState(end_date);

  return (
    <TimelineContext.Provider
      value={{
        uniqueId,
        from_date,
        setFromDate,
        to_date,
        setToDate,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimelineContext = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error(
      'useTimelineContext must be used within a TimelineProvider',
    );
  }
  return context;
};
