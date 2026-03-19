import { useCallback, useMemo, useRef, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
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
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import {
  useGetEventsAggregationQuery,
  useGetProtocolsFromEventsQuery,
} from '@/features/events/common/events.api';
import { addQueryFilter } from '@/features/filtering/filters/query-filters/query-filters.store';
import { ContextMenuContent } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/context-menu/context-menu.content';
import { useGetESMappingQuery } from '@/features/user/settings/settings.api';
import { useAppDispatch } from '@/store/store';

import { useSignatureDetailsParams } from '../signatures-table/signatures-table.utils';

export const SignatureFlow = ({
  sid,
  methodType,
  applyGlobalFilters,
}: {
  sid: number;
  methodType?: string;
  applyGlobalFilters: boolean;
}) => {
  const globalParams = useSignatureDetailsParams(sid, applyGlobalFilters);

  const protocolsQfilter = useMemo(() => {
    const parts = [`alert.signature_id:${sid}`];
    if (globalParams.qfilter) parts.push(globalParams.qfilter);
    return parts.join(' AND ');
  }, [sid, globalParams.qfilter]);

  const { data: protocols, isLoading } = useGetProtocolsFromEventsQuery({
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    qfilter: protocolsQfilter,
    tenant: globalParams.tenant,
  });

  if (isLoading) return null;

  return (
    <>
      {(protocols ?? []).map((appProto) => (
        <SignatureFlowForProtocol
          key={appProto}
          appProto={appProto}
          methodType={methodType}
          globalParams={globalParams}
        />
      ))}
    </>
  );
};

function SignatureFlowForProtocol({
  appProto,
  methodType,
  globalParams,
}: {
  appProto: string;
  methodType?: string;
  globalParams: ReturnType<typeof useGlobalQueryParams>;
}) {
  const dispatch = useAppDispatch();
  const { data: esMapping } = useGetESMappingQuery();

  const columns = useMemo(() => {
    const cols =
      methodType === 'code'
        ? protoColumns.code
        : (protoColumns[appProto] ?? protoColumns.default);
    return cols as ProtoColumn[];
  }, [appProto, methodType]);

  const aggs = useMemo(
    () => buildFlowAggQuery(columns, esMapping),
    [columns, esMapping],
  );

  const qfilter = useMemo(() => {
    const parts: string[] = [];
    if (appProto !== 'default') parts.push(`app_proto:${appProto}`);
    if (globalParams.qfilter) parts.push(globalParams.qfilter);
    const types = [];
    if (globalParams.stamus) types.push('event_type:stamus');
    if (globalParams.alert) types.push('event_type:alert');
    if (globalParams.discovery) types.push('event_type:alert AND discovery:*');
    parts.push(`(${types.join(' OR ')})`);
    return parts.join(' AND ') || undefined;
  }, [
    appProto,
    globalParams.qfilter,
    globalParams.stamus,
    globalParams.alert,
    globalParams.discovery,
  ]);

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

  // Context menu state for right-click on Sankey nodes
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
