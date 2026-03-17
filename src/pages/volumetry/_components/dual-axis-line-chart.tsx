import { add, format } from 'date-fns';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ChartContainer,
  ChartTooltip,
} from '@/common/design-system/atoms/ui/chart';
import { cn } from '@/common/lib/utils';

export type TimelineSeries = {
  key: string;
  label: string;
  color: string;
  data: { time: number; count: number }[];
  interval: number;
};

export type ChartScale = 'normalized' | 'log' | 'default';

type MultiSeriesLineChartProps = {
  series: TimelineSeries[];
  scale?: ChartScale;
  className?: string;
};

function formatLogTick(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}M`;
  if (value >= 1_000) return `${value / 1_000}K`;
  return String(value);
}

function mergeTimelines(
  seriesList: TimelineSeries[],
  scale: ChartScale,
): Record<string, number>[] {
  // Compute max per series for normalized scale
  const maxByKey = new Map<string, number>();
  if (scale === 'normalized') {
    for (const s of seriesList) {
      let max = 0;
      for (const point of s.data) {
        if (point.count > max) max = point.count;
      }
      maxByKey.set(s.key, max);
    }
  }

  const map = new Map<number, Record<string, number>>();

  for (const s of seriesList) {
    const max = maxByKey.get(s.key) ?? 1;
    for (const point of s.data) {
      let entry = map.get(point.time);
      if (!entry) {
        entry = { time: point.time };
        map.set(point.time, entry);
      }
      if (scale === 'normalized') {
        entry[s.key] = max > 0 ? point.count / max : 0;
      } else if (scale === 'log') {
        // Clamp to 1 so log scale can render a continuous line
        entry[s.key] = Math.max(point.count, 1);
      } else {
        // default: raw values
        entry[s.key] = point.count;
      }
      // Raw value for tooltip display
      entry[`${s.key}_raw`] = point.count;
    }
  }

  // Fill missing keys
  const fillValue = scale === 'log' ? 1 : 0;
  const keys = seriesList.map((s) => s.key);
  for (const entry of map.values()) {
    for (const key of keys) {
      if (!(key in entry)) {
        entry[key] = fillValue;
        entry[`${key}_raw`] = 0;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.time - b.time);
}

export const MultiSeriesLineChart = ({
  series,
  scale = 'log',
  className,
}: MultiSeriesLineChartProps) => {
  const chartData = React.useMemo(
    () => mergeTimelines(series, scale),
    [series, scale],
  );

  const interval = series.find((s) => s.interval > 0)?.interval ?? 0;

  const chartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  );

  return (
    <ChartContainer
      config={chartConfig}
      className={cn('aspect-auto h-[200px] w-full', className)}
    >
      <AreaChart
        data={chartData}
        margin={{ left: 0, right: 0 }}
      >
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.key}
              id={`gradient-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={s.color}
                stopOpacity={0.55}
              />
              <stop
                offset="100%"
                stopColor={s.color}
                stopOpacity={0}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        {scale === 'log' && (
          <YAxis
            scale="log"
            domain={[1, 'auto']}
            allowDataOverflow
            tickFormatter={formatLogTick}
            width={50}
            axisLine={false}
            tickLine={false}
          />
        )}
        {scale === 'default' && (
          <YAxis
            tickFormatter={formatLogTick}
            width={50}
            axisLine={false}
            tickLine={false}
          />
        )}
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
        <ChartTooltip
          content={
            <MultiSeriesTooltipContent
              series={series}
              interval={interval}
            />
          }
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={1.5}
            fill={`url(#gradient-${s.key})`}
            dot={false}
            name={s.label}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};

function MultiSeriesTooltipContent({
  active,
  payload,
  series,
  interval,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: Record<string, number>;
  }>;
  series: TimelineSeries[];
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
        {series.map((s) => (
          <Row
            key={s.key}
            className="items-center gap-2"
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground flex-1">{s.label}</span>
            <span className="font-mono font-medium tabular-nums">
              {(point[`${s.key}_raw`] ?? 0).toLocaleString()}
            </span>
          </Row>
        ))}
      </div>
    </div>
  );
}
