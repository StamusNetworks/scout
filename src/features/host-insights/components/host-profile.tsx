import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/common/design-system/atoms/ui/chart';

const chartConfig = {
  count: {
    label: 'Count',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface HostProfileProps {
  data: { label: string; count: number }[] | undefined;
}

export const HostProfile = ({ data }: HostProfileProps) => {
  return (
    <ChartContainer config={chartConfig}>
      <RadarChart data={data}>
        <ChartTooltip
          cursor={false}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          content={(props: any) => (
            <ChartTooltipContent
              {...props}
              label={props.label ?? ''}
            />
          )}
        />
        <PolarAngleAxis dataKey="label" />
        <PolarGrid />
        <Radar
          dataKey="count"
          fill="var(--color-count)"
          fillOpacity={0.6}
          dot={{
            r: 4,
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
};
