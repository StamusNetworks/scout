import { add, format } from 'date-fns';
import { toPairs } from 'ramda';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/common/design-system/atoms/ui/chart';
import { cn } from '@/common/lib/utils';
import { CountsTimeline } from '@/features/events';

import { getTimelineData } from './bar-chart-timeline.utils';

export const BarChartTimeline = ({
  data,
  className,
}: {
  data: CountsTimeline;
  className?: string;
}) => {
  const chart = React.useMemo(() => {
    if (!data)
      return {
        chartConfig: {} as Record<string, { label: string; color: string }>,
        chartData: [],
        dates: {
          interval: 0,
        },
      };
    return getTimelineData(data as CountsTimeline);
  }, [data]);

  return (
    <ChartContainer
      config={chart.chartConfig || {}}
      className={cn('aspect-auto h-[250px] w-full', className)}
    >
      <AreaChart
        accessibilityLayer
        data={chart.chartData}
      >
        <defs>
          {typeof chart.chartData === 'object' &&
            toPairs(chart.chartConfig).map(([key, value]) => (
              <linearGradient
                key={key}
                id={`gradient-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={value.color}
                  stopOpacity={0.6}
                />
                <stop
                  offset="100%"
                  stopColor={value.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
        </defs>
        <CartesianGrid vertical={false} />
        <YAxis />
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
                year: 'numeric',
              }) +
              ' ' +
              date.toLocaleTimeString('en-US')
            );
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[205px]"
              labelKey="time"
              nameKey="time"
              labelFormatter={(_, value) => {
                const castedValue = value as Payload<ValueType, NameType>[];
                if (
                  Array.isArray(castedValue) &&
                  castedValue[0]?.payload.time
                ) {
                  const date = new Date(castedValue[0]?.payload.time);
                  return (
                    <Column className="text-xs">
                      <Row className="w-full justify-between">
                        <div>From:</div>
                        <div>{format(date, 'yyyy-MM-dd HH:mm:ss')}</div>
                      </Row>
                      <Row className="w-full justify-between">
                        <div>To:</div>
                        <div>
                          {format(
                            add(date, {
                              seconds: chart.dates?.interval / 1000,
                            }),
                            'yyyy-MM-dd HH:mm:ss',
                          )}
                        </div>
                      </Row>
                    </Column>
                  );
                } else {
                  return '';
                }
              }}
            />
          }
        />
        {typeof chart.chartData === 'object' &&
          toPairs(chart.chartConfig).map(([key, value]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              fill={`url(#gradient-${key})`}
              stroke={value.color}
              strokeWidth={1.5}
              fillOpacity={1}
              stackId="stack1"
            />
          ))}
      </AreaChart>
    </ChartContainer>
  );
};
