import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/common/design-system/atoms/ui/chart';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import {
  ComposablePagination,
  PageSelector,
} from '@/common/design-system/molecules/pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { formatNumber } from '@/common/lib/numbers';
import { useGetDashboardFieldsQuery } from '@/features/events/detection-events/use-cases/explorer/api/dashboard.api';
import { replaceFilters } from '@/features/filtering/query-filters/store/query-filters.slice';
import { enableTags } from '@/features/filtering/query-filters/use-cases/enable-tags';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';
import { useAppDispatch } from '@/store/store';

export const MitreTechniques = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationState();
  const { data, config, total, isError, isEmpty } = useGetDashboardFieldsQuery(
    {
      ...params,
      alert: true,
      discovery: true,
      stamus: true,
      fields: 'alert.metadata.mitre_technique_name',
      page_size: 100000,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data:
          result.data?.['alert.metadata.mitre_technique_name']?.map((item) => ({
            ...item,
            fill: `var(--color-${item.key})`,
          })) || [],
        config:
          result.data?.['alert.metadata.mitre_technique_name']?.reduce(
            (acc, curr, i) => {
              acc[curr.key] = {
                label: curr.key,
                color: `var(--chart-${(i % 5) + 1})`,
              };
              return acc;
            },
            {} as Record<string, ChartConfig[keyof ChartConfig]>,
          ) || {},
        total:
          result.data?.['alert.metadata.mitre_technique_name']?.reduce(
            (acc, curr) => acc + curr.doc_count,
            0,
          ) || 0,
        isEmpty: !result.data?.['alert.metadata.mitre_technique_name']?.length,
      }),
    },
  );

  const handleClickMitreTechnique = (data: { name: string }) => {
    enableTags(dispatch);
    dispatch(
      replaceFilters([
        {
          key: 'alert.metadata.mitre_technique_name',
          value: data.name,
        },
      ]),
    );
    navigate({ to: '/explorer' });
  };

  if (isError) {
    return <div>There was an error while fetching the data</div>;
  }

  if (isEmpty) {
    return (
      <Empty className="border">
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyContent>
          <EmptyHeader>No MITRE Techniques found</EmptyHeader>
          <EmptyDescription>
            Either there are no events in the selected time period, or none of
            them have a MITRE Technique associated.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }
  return (
    <Column>
      <Grid className="grid-cols-[minmax(14rem,2fr)_3fr] gap-6">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square min-h-64"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="key"
                  formatter={(value, name, item) => (
                    <Row className="flex-nowrap items-center gap-1 text-nowrap">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                        style={
                          {
                            '--color-bg': `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {item.payload.key.replaceAll('_', ' ')}
                      <div className="text-foreground ml-4 flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                        {`${Math.round(((value as number) / total) * 100)}% (${value})`}
                      </div>
                    </Row>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="doc_count"
              nameKey="key"
              innerRadius={60}
              onClick={handleClickMitreTechnique}
              cursor="pointer"
            >
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
                          {formatNumber(total)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <Column className="gap-1 truncate">
          {data
            .slice(
              pagination.pageIndex * pagination.pageSize,
              (pagination.pageIndex + 1) * pagination.pageSize,
            )
            .map((item) => (
              <Row
                className="items-center justify-between gap-2"
                key={item.key}
              >
                <EventValue
                  query_key="alert.metadata.mitre_technique_name"
                  className="truncate text-sm"
                  value={item.key}
                  onClick={() => handleClickMitreTechnique({ name: item.key })}
                />
                <Badge variant="secondary">
                  {formatNumber(item.doc_count)}
                </Badge>
              </Row>
            ))}
        </Column>
      </Grid>
      <Row className="mt-2 justify-end">
        <ComposablePagination
          className="px-0"
          areSomeRowsSelected={false}
          selectedRowsCount={0}
          rowsCount={data.length}
          totalCount={total}
          pageSize={pagination.pageSize}
          pageIndex={pagination.pageIndex}
          onPageSizeChange={(pageSize) =>
            setPagination((prev) => ({ ...prev, pageSize }))
          }
          onPageIndexChange={(pageIndex) =>
            setPagination((prev) => ({ ...prev, pageIndex }))
          }
          isPreviousPage={pagination.pageIndex > 0}
          isNextPage={
            pagination.pageIndex <
            Math.ceil(data.length / pagination.pageSize) - 1
          }
          pageCount={Math.ceil(data.length / pagination.pageSize)}
        >
          <PageSelector />
        </ComposablePagination>
      </Row>
    </Column>
  );
};
