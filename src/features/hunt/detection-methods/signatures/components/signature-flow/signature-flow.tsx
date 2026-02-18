import { useCallback, useMemo, useRef, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import { DateTime } from '@/common/design-system/entities/date-time';
import type { ProtoColumn } from '@/common/design-system/graphs/proto-flow/flow.columns';
import protoColumns from '@/common/design-system/graphs/proto-flow/flow.columns';
import {
  SankeyChart,
  type SankeyNodeInfo,
} from '@/common/design-system/graphs/sankey/sankey-chart';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { ContextMenuContent } from '@/features/hunt/filtering/query-filters/components/event-value/context-menu/context-menu.content';
import { addQueryFilter } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { useGetESMappingQuery } from '@/features/user/settings/settings.api';
import { useAppDispatch } from '@/store/store';

import {
  useGetSignatureFlowAggregationQuery,
  useGetSignatureFlowProtocolsQuery,
} from '../../api/signature-flow.api';
import { useSignatureDetailsParams } from '../signatures-table/signatures-table.utils';
import {
  buildSignatureFlowAggQuery,
  buildSignatureFlowProtocolsQuery,
  extractTimestamps,
  getMaxNodesPerColumn,
  transformAggToSankey,
} from './signature-flow.utils';

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

  const protocolsBody = useMemo(
    () =>
      buildSignatureFlowProtocolsQuery(
        sid,
        globalParams.qfilter,
        globalParams.tenant,
      ),
    [sid, globalParams.qfilter, globalParams.tenant],
  );

  const { data: protocolsData, isLoading } = useGetSignatureFlowProtocolsQuery({
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    body: protocolsBody,
  });

  const protocols = useMemo(() => {
    const buckets = protocolsData?.aggregations?.protocols?.buckets ?? [];
    if (buckets.length === 0) return ['default'];
    return buckets.map((b) => b.key);
  }, [protocolsData]);

  if (isLoading) return null;

  return (
    <>
      {protocols.map((appProto) => (
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

  const body = useMemo(
    () =>
      buildSignatureFlowAggQuery(
        appProto,
        columns,
        globalParams.qfilter,
        globalParams.tenant,
        esMapping,
      ),
    [appProto, columns, globalParams.qfilter, globalParams.tenant, esMapping],
  );

  const { data } = useGetSignatureFlowAggregationQuery({
    ...globalParams,
    body,
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
      <Row className="my-2 gap-2">
        <DetectionAttribute title="App proto">
          {appProto === 'default' ? 'unknown' : appProto.toUpperCase()}
        </DetectionAttribute>
        {timestamps.firstSeen && (
          <DetectionAttribute title="First seen">
            <DateTime date={timestamps.firstSeen} />
          </DetectionAttribute>
        )}
        {timestamps.lastSeen && (
          <DetectionAttribute title="Last seen">
            <DateTime date={timestamps.lastSeen} />
          </DetectionAttribute>
        )}
      </Row>
    </Column>
  );
}

function DetectionAttribute({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Column className="bg-muted w-[200px] rounded-md px-2 py-2">
      <div className="text-muted-foreground text-xs font-bold">{title}</div>
      <div className="text-xs">{children}</div>
    </Column>
  );
}
