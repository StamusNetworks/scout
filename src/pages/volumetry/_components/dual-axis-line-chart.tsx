import { add, format } from 'date-fns';
import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ChartContainer,
  ChartTooltip,
} from '@/common/design-system/atoms/ui/chart';
import { cn } from '@/common/lib/utils';

export type DualAxisTimelineData = {
  data: { time: number; count: number }[];
  interval: number;
};

type DualAxisLineChartProps = {
  leftSeries: DualAxisTimelineData;
  rightSeries: DualAxisTimelineData;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
  className?: string;
};

type MergedPoint = {
  time: number;
  left: number;
  right: number;
};

function mergeTimelines(
  left: { time: number; count: number }[],
  right: { time: number; count: number }[],
): MergedPoint[] {
  const map = new Map<number, MergedPoint>();

  for (const point of left) {
    map.set(point.time, { time: point.time, left: point.count, right: 0 });
  }
  for (const point of right) {
    const existing = map.get(point.time);
    if (existing) {
      existing.right = point.count;
    } else {
      map.set(point.time, { time: point.time, left: 0, right: point.count });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.time - b.time);
}

export const DualAxisLineChart = ({
  leftSeries,
  rightSeries,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
  className,
}: DualAxisLineChartProps) => {
  const chartData = React.useMemo(
    () => mergeTimelines(leftSeries.data, rightSeries.data),
    [leftSeries.data, rightSeries.data],
  );

  const interval = leftSeries.interval || rightSeries.interval;

  const chartConfig = {
    left: { label: leftLabel, color: leftColor },
    right: { label: rightLabel, color: rightColor },
  };

  return (
    <ChartContainer
      config={chartConfig}
      className={cn('aspect-auto h-[200px] w-full', className)}
    >
      <LineChart
        data={chartData}
        margin={{ left: 0, right: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickMargin={8}
          minTickGap={48}
          tickFormatter={(value) => {
            const date = new Date(value);
            return (
              date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }) +
              ' ' +
              date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            );
          }}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={formatAxisValue}
          width={50}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={formatAxisValue}
          width={50}
        />
        <ChartTooltip
          content={
            <DualAxisTooltipContent
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              leftColor={leftColor}
              rightColor={rightColor}
              interval={interval}
            />
          }
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="left"
          stroke={leftColor}
          strokeWidth={2}
          dot={false}
          name={leftLabel}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="right"
          stroke={rightColor}
          strokeWidth={2}
          dot={false}
          name={rightLabel}
        />
      </LineChart>
    </ChartContainer>
  );
};

function formatAxisValue(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function DualAxisTooltipContent({
  active,
  payload,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
  interval,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: MergedPoint }>;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
  interval: number;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const date = new Date(point.time);

  return (
    <div className="border-border/50 bg-background min-w-40 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <Column className="mb-1.5">
        <Row className="w-full justify-between">
          <span>From:</span>
          <span>{format(date, 'yyyy-MM-dd HH:mm:ss')}</span>
        </Row>
        <Row className="w-full justify-between">
          <span>To:</span>
          <span>
            {format(
              add(date, { seconds: interval / 1000 }),
              'yyyy-MM-dd HH:mm:ss',
            )}
          </span>
        </Row>
      </Column>
      <div className="grid gap-1">
        <Row className="items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: leftColor }}
          />
          <span className="text-muted-foreground flex-1">{leftLabel}</span>
          <span className="font-mono font-medium tabular-nums">
            {point.left.toLocaleString()}
          </span>
        </Row>
        <Row className="items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: rightColor }}
          />
          <span className="text-muted-foreground flex-1">{rightLabel}</span>
          <span className="font-mono font-medium tabular-nums">
            {point.right.toLocaleString()}
          </span>
        </Row>
      </div>
    </div>
  );
}
