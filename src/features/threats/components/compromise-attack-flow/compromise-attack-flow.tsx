import { useCallback, useMemo, useRef, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import type { ProtoColumn } from '@/common/design-system/graphs/proto-flow/flow.columns';
import {
  SankeyChart,
  type SankeyNodeInfo,
} from '@/common/design-system/graphs/sankey/sankey-chart';
import {
  buildFlowAggQuery,
  getMaxNodesPerColumn,
  transformAggToSankey,
} from '@/common/design-system/graphs/sankey/sankey.utils';
import { useGetEventsAggregationQuery } from '@/features/events';
import { ContextMenuContent } from '@/features/query-filters/components/interactive-value/context-menu/context-menu.content';
import { useCreateFilter } from '@/features/query-filters/hooks/use-create-filter';
import { useESMapping } from '@/features/query-filters/hooks/use-es-mapping';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const ATTACK_FLOW_COLUMNS: ProtoColumn[] = [
  {
    title: 'Victim',
    key: 'stamus.asset',
    missing: 'N/A',
  },
  {
    title: 'Killchain',
    key: 'stamus.kill_chain',
    missing: 'N/A',
  },
  {
    title: 'Threat name',
    key: 'stamus.threat_name',
    missing: 'N/A',
  },
  {
    title: 'Detection method',
    key: 'alert.signature',
    missing: 'N/A',
  },
  {
    title: 'Attacker',
    key: 'stamus.source',
    missing: 'N/A',
  },
];

export const CompromiseAttackFlow = () => {
  const createFilter = useCreateFilter();
  const globalParams = useGlobalQueryParams(['dates', 'tenant', 'qfilter']);
  const { data: esMapping } = useESMapping();

  const aggs = useMemo(
    () => buildFlowAggQuery(ATTACK_FLOW_COLUMNS, esMapping),
    [esMapping],
  );

  const { data } = useGetEventsAggregationQuery({
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    qfilter: 'event_type:stamus AND NOT stamus.kill_chain:pre_condition',
    tenant: globalParams.tenant,
    aggs,
  });

  const sankeyData = useMemo(() => {
    if (!data?.aggregations) return { nodes: [], links: [], paths: [] };
    return transformAggToSankey(
      data.aggregations,
      ATTACK_FLOW_COLUMNS,
      esMapping,
    );
  }, [data, esMapping]);

  const sankeyHeight = useMemo(
    () => getMaxNodesPerColumn(sankeyData) * 30,
    [sankeyData],
  );

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
      const col = ATTACK_FLOW_COLUMNS[node.columnIndex];
      if (node.name === 'N/A') {
        createFilter({ key: 'es_filter', value: `NOT ${col.key}:*` });
      } else {
        createFilter({ key: col.key, value: node.name });
      }
    },
    [createFilter],
  );

  const handleNodeRightClick = useCallback((node: SankeyNodeInfo) => {
    const col = ATTACK_FLOW_COLUMNS[node.columnIndex];
    if (col) pendingNodeRef.current = { query_key: col.key, value: node.name };
  }, []);

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
        <ContextMenuTrigger>
          <SankeyChart
            data={sankeyData}
            height={sankeyHeight}
            onNodeClick={handleNodeClick}
            onNodeRightClick={handleNodeRightClick}
          />
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
};
