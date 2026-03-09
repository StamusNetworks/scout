import { Workflow } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { DateTime } from '@/common/design-system/entities/date-time';
import type { ProtoColumn } from '@/common/design-system/graphs/proto-flow/flow.columns';
import protoColumns from '@/common/design-system/graphs/proto-flow/flow.columns';
import {
  buildFlowAggQuery,
  extractTimestamps,
  getMaxNodesPerColumn,
  transformAggToSankey,
} from '@/common/design-system/graphs/sankey/sankey.utils';
import {
  SankeyChart,
  type SankeyNodeInfo,
} from '@/common/design-system/graphs/sankey/sankey-chart';
import {
  TitleRow,
  TitleRowEnd,
  TitleRowStart,
  TitleRowTitle,
} from '@/common/design-system/graphs/sankey/sankey-title-row';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { usePageTitle } from '@/common/lib/use-page-title';
import {
  useGetEventsAggregationQuery,
  useGetProtocolsFromEventsQuery,
} from '@/features/hunt/events/api/events.api';
import { ContextMenuContent } from '@/features/hunt/filtering/query-filters/components/event-value/context-menu/context-menu.content';
import type { EventTypes } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { addQueryFilter } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { useGetESMappingQuery } from '@/features/user/settings/settings.api';
import { useAppDispatch } from '@/store/store';

function buildEventsFlowQfilter(
  qfilter?: string,
  eventTypes?: EventTypes | null,
): string | undefined {
  const parts: string[] = [];
  if (qfilter) parts.push(qfilter);

  if (eventTypes) {
    const activeTypes = [
      eventTypes.alert && 'event_type:alert',
      eventTypes.stamus && 'event_type:stamus',
      eventTypes.discovery && 'event_type:discovery',
    ].filter(Boolean);
    // Only restrict when a subset is active (all true = no restriction needed)
    if (activeTypes.length > 0) {
      parts.push(`(${activeTypes.join(' OR ')})`);
    }
  }

  return parts.length ? parts.join(' AND ') : undefined;
}

export const EventsFlowPage = () => {
  usePageTitle('Events Flow');

  return (
    <>
      <OutletBreadcrumb>Events Flow</OutletBreadcrumb>
      <DefaultPage
        title="Events Flow"
        description="Visualize event flows grouped by application protocol using Sankey charts, enabling deep exploration of network traffic patterns across all detection events."
      >
        <EventsFlow />
      </DefaultPage>
    </>
  );
};

function EventsFlow() {
  const globalParams = useGlobalQueryParams(['dates', 'qfilter', 'tenant']);

  const eventTypes = useMemo(
    () =>
      globalParams.alert !== undefined
        ? {
            alert: globalParams.alert,
            stamus: globalParams.stamus!,
            discovery: globalParams.discovery!,
          }
        : null,
    [globalParams.alert, globalParams.stamus, globalParams.discovery],
  );

  const protocolsQfilter = useMemo(
    () => buildEventsFlowQfilter(globalParams.qfilter, eventTypes),
    [globalParams.qfilter, eventTypes],
  );

  const { data: protocols, isLoading } = useGetProtocolsFromEventsQuery({
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    qfilter: protocolsQfilter,
    tenant: globalParams.tenant,
  });

  if (isLoading) {
    return <Spin />;
  }

  if (!protocols?.length) {
    return (
      <Empty className="border md:py-32">
        <EmptyMedia variant="icon">
          <Workflow />
        </EmptyMedia>
        <EmptyContent>
          <EmptyHeader>No events found</EmptyHeader>
          <EmptyDescription>
            Either there are no events or the filters are too restrictive.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Column className="gap-6">
      {protocols.map((appProto) => (
        <EventsFlowForProtocol
          key={appProto}
          appProto={appProto}
          globalParams={globalParams}
          eventTypes={eventTypes}
        />
      ))}
    </Column>
  );
}

function EventsFlowForProtocol({
  appProto,
  globalParams,
  eventTypes,
}: {
  appProto: string;
  globalParams: ReturnType<typeof useGlobalQueryParams>;
  eventTypes: EventTypes | null;
}) {
  const dispatch = useAppDispatch();
  const { data: esMapping } = useGetESMappingQuery();

  const columns = useMemo(() => {
    const cols = protoColumns[appProto] ?? protoColumns.default;
    return cols as ProtoColumn[];
  }, [appProto]);

  const enhancedQfilter = useMemo(
    () => buildEventsFlowQfilter(globalParams.qfilter, eventTypes),
    [globalParams.qfilter, eventTypes],
  );

  const aggs = useMemo(
    () => buildFlowAggQuery(columns, esMapping),
    [columns, esMapping],
  );

  const qfilter = useMemo(() => {
    const parts: string[] = [];
    if (appProto !== 'default') parts.push(`app_proto:${appProto}`);
    if (enhancedQfilter) parts.push(enhancedQfilter);
    return parts.join(' AND ') || undefined;
  }, [appProto, enhancedQfilter]);

  const { data } = useGetEventsAggregationQuery({
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    qfilter,
    tenant: globalParams.tenant,
    aggs,
  });

  const sankeyData = useMemo(() => {
    if (!data?.aggregations) return { nodes: [], links: [], paths: [] };
    return transformAggToSankey(data.aggregations, columns, esMapping);
  }, [data, columns, esMapping]);

  const sankeyHeight = useMemo(
    () => getMaxNodesPerColumn(sankeyData) * 30,
    [sankeyData],
  );

  const timestamps = useMemo(() => {
    if (!data?.aggregations) return {};
    return extractTimestamps(data.aggregations);
  }, [data]);

  const pendingNodeRef = useRef<{
    query_key: string;
    value: string | number;
  } | null>(null);
  const [contextNode, setContextNode] = useState<{
    query_key: string;
    value: string | number;
  } | null>(null);

  const handleNodeClick = useCallback(
    (node: SankeyNodeInfo) => {
      const col = columns[node.columnIndex];
      if (node.name === 'N/A') {
        dispatch(
          addQueryFilter({ key: 'es_filter', value: `NOT ${col.key}:*` }),
        );
      } else {
        dispatch(addQueryFilter({ key: col.key, value: node.name }));
      }
    },
    [columns, dispatch],
  );

  const handleNodeRightClick = useCallback(
    (node: SankeyNodeInfo) => {
      const col = columns[node.columnIndex];
      if (col)
        pendingNodeRef.current = { query_key: col.key, value: node.name };
    },
    [columns],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setContextNode(pendingNodeRef.current);
      pendingNodeRef.current = null;
    } else {
      setContextNode(null);
    }
  }, []);

  if (!sankeyData.nodes.length) return null;

  return (
    <Column>
      <TitleRow>
        <TitleRowStart>
          <TitleRowTitle>
            {appProto === 'default' ? 'Unknown' : appProto.toUpperCase()}
          </TitleRowTitle>
        </TitleRowStart>
        <TitleRowEnd>
          {timestamps.firstSeen && (
            <StatsBlock
              label="First seen"
              value={<DateTime date={timestamps.firstSeen} />}
            />
          )}
          {timestamps.lastSeen && (
            <StatsBlock
              label="Last seen"
              value={<DateTime date={timestamps.lastSeen} />}
            />
          )}
        </TitleRowEnd>
      </TitleRow>
      <ContextMenu onOpenChange={handleOpenChange}>
        <ContextMenuTrigger asChild>
          <div>
            <SankeyChart
              data={sankeyData}
              height={sankeyHeight}
              onNodeClick={handleNodeClick}
              onNodeRightClick={handleNodeRightClick}
            />
          </div>
        </ContextMenuTrigger>
        {contextNode && (
          <ContextMenuContent
            query_key={contextNode.query_key}
            value={contextNode.value}
            displayValue={String(contextNode.value)}
          />
        )}
      </ContextMenu>
    </Column>
  );
}
