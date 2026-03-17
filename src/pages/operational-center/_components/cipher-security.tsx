import { add, format } from 'date-fns';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/common/design-system/atoms/ui/chart';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { cn } from '@/common/lib/utils';
import { useGetEventsTimelineQuery } from '@/features/hunt/events/api/events.api';

const chartConfig = {
  // pre_condition: {
  //   label: 'Policy Violation',
  //   color: 'hsl(var(--pre-condition))',
  // },
  recommended: {
    label: 'Recommended',
    color: 'var(--chart-1)',
  },
  insecure: {
    label: 'Insecure',
    color: 'var(--color-red-500)',
  },
  degraded: {
    label: 'Degraded',
    color: 'var(--color-yellow-500)',
  },
};

const RANGES_COUNT = 100;

export const CipherSecurity = () => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  const interval = useMemo(
    () =>
      Math.ceil(
        ((params.end_date || new Date().getTime()) - (params.start_date || 0)) /
          RANGES_COUNT /
          1000,
      ),
    [params.start_date, params.end_date],
  );
  const { data: recommendedData } = useGetEventsTimelineQuery({
    ...params,
    interval,
    qfilter: 'tls.cipher_security:recommended',
  });
  const { data: insecureData } = useGetEventsTimelineQuery({
    ...params,
    interval,
    qfilter: 'tls.cipher_security:insecure',
  });
  const { data: degradedData } = useGetEventsTimelineQuery({
    ...params,
    interval,
    qfilter: 'tls.cipher_security:degraded',
  });

  const data = useMemo(() => {
    if (!recommendedData || !insecureData || !degradedData) return undefined;
    return recommendedData.map((recommended, i) => ({
      ...recommended,
      recommended: recommendedData[i]?.count,
      insecure: insecureData[i]?.count,
      degraded: degradedData[i]?.count,
    }));
  }, [recommendedData, insecureData, degradedData]);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn('aspect-auto h-[250px] w-full')}
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id="gradient-recommended"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="var(--color-recommended)"
              stopOpacity={0.6}
            />
            <stop
              offset="100%"
              stopColor="var(--color-recommended)"
              stopOpacity={0.05}
            />
          </linearGradient>
          <linearGradient
            id="gradient-degraded"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="var(--color-degraded)"
              stopOpacity={0.6}
            />
            <stop
              offset="100%"
              stopColor="var(--color-degraded)"
              stopOpacity={0.05}
            />
          </linearGradient>
          <linearGradient
            id="gradient-insecure"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="var(--color-insecure)"
              stopOpacity={0.6}
            />
            <stop
              offset="100%"
              stopColor="var(--color-insecure)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
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
                              seconds: interval,
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
        <Area
          key={'insecure'}
          type="monotone"
          stackId="a"
          dataKey="insecure"
          fill="url(#gradient-insecure)"
          stroke={`var(--color-insecure)`}
          strokeWidth={1.5}
          fillOpacity={1}
        />
        <Area
          key={'degraded'}
          type="monotone"
          stackId="a"
          dataKey="degraded"
          fill="url(#gradient-degraded)"
          stroke={`var(--color-degraded)`}
          strokeWidth={1.5}
          fillOpacity={1}
        />
        <Area
          key={'recommended'}
          type="monotone"
          stackId="a"
          dataKey="recommended"
          fill="url(#gradient-recommended)"
          stroke={`var(--color-recommended)`}
          strokeWidth={1.5}
          fillOpacity={1}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
};
