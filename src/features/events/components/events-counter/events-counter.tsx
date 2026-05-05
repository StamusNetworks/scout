import { Column } from '@/common/design-system/atoms/layout/column';
import { ChartConfig } from '@/common/design-system/atoms/ui/chart';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { PieChart } from '@/common/design-system/graphs/pie-chart/pie-chart';
import { formatNumber } from '@/common/lib/numbers';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsCountQuery } from '../../api/events.api';

const chartConfig = {
  current: {
    label: 'Current period',
    color: 'var(--chart-1)',
  },
  previous: {
    label: 'Previous period',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export const EventsCounter = () => {
  const params = useGlobalQueryParams([
    'tenant',
    'dates',
    'qfilter',
    'qfilterHost',
  ]);
  const { data, isLoading } = useGetEventsCountQuery({
    ...params,
    prev: 1,
  });

  const chartData = [
    {
      period: 'current',
      value: data?.doc_count || 0,
      fill: 'var(--color-current)',
    },
    {
      period: 'previous',
      value: data?.prev_doc_count || 0,
      fill: 'var(--color-previous)',
    },
  ];

  if (isLoading) {
    return (
      <Column className="translate-y-1 items-center justify-center">
        <Spin />
      </Column>
    );
  }

  if (!data?.doc_count && !data?.prev_doc_count) {
    return (
      <Column className="translate-y-1 items-center justify-center">
        <span className="text-foreground text-3xl font-bold">0</span>
        <span className="text-muted-foreground text-xs">Current count</span>
      </Column>
    );
  }

  return (
    <PieChart
      config={chartConfig}
      data={chartData}
      nameKey="period"
      dataKey="value"
      center={{
        count: formatNumber(data?.doc_count || 0),
        label: 'Current count',
      }}
    />
  );
};
