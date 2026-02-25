import { useOptimistic, useTransition } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/common/design-system/atoms/ui/toggle-group';

import { type SeriesKey, TIMELINE_SERIES } from './timeline.constants';
import { useTimelineVisibility } from './use-timeline-visibility';

export function SeriesToggleBar() {
  const [enabledSeries, setEnabledSeries] = useTimelineVisibility();
  const [optimisticSeries, setOptimisticSeries] = useOptimistic(enabledSeries);
  const [, startTransition] = useTransition();

  const handleChange = (value: string[]) => {
    const typed = value as SeriesKey[];
    setOptimisticSeries(typed);
    startTransition(() => {
      setEnabledSeries(typed);
    });
  };

  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      size="sm"
      value={optimisticSeries}
      onValueChange={handleChange}
      className="flex-wrap justify-start"
    >
      {TIMELINE_SERIES.map((s) => (
        <ToggleGroupItem
          key={s.key}
          value={s.key}
          className="group border-transparent shadow-none"
        >
          <Row className="items-center gap-1.5">
            <div
              className="bg-muted-foreground h-2.5 w-2.5 shrink-0 rounded-full group-data-[state=on]:bg-(--color)"
              style={{ '--color': s.color } as React.CSSProperties}
            />
            <span className="text-xs">{s.label}</span>
          </Row>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
