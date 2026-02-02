import { add, format } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
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
import { setDates } from '@/features/hunt/filtering/dates-filters/dates-filters.slice';
import { replaceFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { enableTags } from '@/features/hunt/filtering/query-filters/use-cases/enable-tags';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

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

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleClick = useCallback(
    (
      value: 'recommended' | 'insecure' | 'degraded',
      payload: { time: number },
    ) => {
      enableTags(dispatch);
      dispatch(
        setDates({
          type: 'range',
          start_date: payload.time,
          end_date: add(payload.time, {
            seconds: interval,
          }).getTime(),
        }),
      );
      dispatch(replaceFilters([{ key: 'tls.cipher_security', value }]));
      navigate(routes.session_events);
    },
    [interval, dispatch, navigate],
  );

  return (
    <ChartContainer
      config={chartConfig}
      className={cn('aspect-auto h-[250px] w-full')}
    >
      <BarChart data={data}>
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
        <Bar
          key={'recommended'}
          stackId="a"
          dataKey="recommended"
          fill={`var(--color-recommended)`}
          onClick={({ payload }) => handleClick('recommended', payload)}
        />
        <Bar
          key={'degraded'}
          stackId="a"
          dataKey="degraded"
          fill={`var(--color-degraded)`}
          onClick={({ payload }) => handleClick('degraded', payload)}
        />
        <Bar
          key={'insecure'}
          stackId="a"
          dataKey="insecure"
          fill={`var(--color-insecure)`}
          onClick={({ payload }) => handleClick('insecure', payload)}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
};
