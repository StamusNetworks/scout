import { useCallback, useMemo, useRef, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import { DateTime } from '@/common/design-system/entities/date-time';
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
import {
  buildFlowAggQuery,
  extractTimestamps,
  getMaxNodesPerColumn,
  transformAggToSankey,
} from '@/common/design-system/graphs/sankey/sankey.utils';
import { buildEventsFlowQfilter } from '@/features/events/builders/build-events-flow-qfilter';
import { type EventTypeFlags } from '@/features/query-filters';
import { ContextMenuContent } from '@/features/query-filters/components/interactive-value/context-menu/context-menu.content';
import { useCreateFilter } from '@/features/query-filters/hooks/use-create-filter';
import { useESMapping } from '@/features/query-filters/hooks/use-es-mapping';

import { useGetEventsAggregationQuery } from '../../api/events.api';
import type { ProtoColumn } from '../../definitions/events-flow.columns';
import protoColumns from '../../definitions/events-flow.columns';

export interface EventsFlowForProtocolProps {
  appProto: string;
  globalParams: {
    start_date?: number;
    end_date?: number;
    tenant?: number;
    qfilter?: string;
  };
  eventTypes: EventTypeFlags | null;
}

export function EventsFlowForProtocol({
  appProto,
  globalParams,
  eventTypes,
}: EventsFlowForProtocolProps) {
  const createFilter = useCreateFilter();
  const { data: esMapping } = useESMapping();

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
        createFilter({ key: 'es_filter', value: `NOT ${col.key}:*` });
      } else {
        createFilter({ key: col.key, value: node.name });
      }
    },
    [columns, createFilter],
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
