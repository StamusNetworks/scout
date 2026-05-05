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

interface HostDetectionsRadarProps {
  threatsVictim: number;
  threatsAttacker: number;
  beacons: number;
  detectionMethods: number;
  sightings: number;
  outlierEvents: number;
}

export const HostDetectionsRadar = (data: HostDetectionsRadarProps) => {
  return (
    <ChartContainer config={chartConfig}>
      <RadarChart
        data={[
          {
            count: data.threatsVictim,
            label: `Victim (${data.threatsVictim})`,
          },
          {
            count: data.threatsAttacker,
            label: `Attacker (${data.threatsAttacker})`,
          },
          {
            count: data.beacons,
            label: `Beacons (${data.beacons})`,
          },
          {
            count: data.detectionMethods,
            label: `Detection Methods (${data.detectionMethods})`,
          },
          {
            count: data.sightings,
            label: `Sightings (${data.sightings})`,
          },
          {
            count: data.outlierEvents,
            label: `Outlier Events (${data.outlierEvents})`,
          },
        ]}
      >
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
