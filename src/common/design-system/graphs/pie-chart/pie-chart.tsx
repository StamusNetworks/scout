import { Label, Pie, PieChart as RePieChart } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/common/design-system/atoms/ui/chart';

export function PieChart({
  config,
  data,
  center,
  nameKey,
  dataKey,
}: {
  config: ChartConfig;
  data: Record<string, unknown>[];
  nameKey: string;
  dataKey: string;
  center?: { count: number | string; label: string };
}) {
  return (
    <ChartContainer
      config={config}
      className="aspect-square"
    >
      <RePieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={85}
          strokeWidth={5}
        >
          {center && (
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {center.count}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        {center.label}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          )}
        </Pie>
      </RePieChart>
    </ChartContainer>
  );
}
