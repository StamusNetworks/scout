import { useCallback, useMemo, useRef, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import type { ProtoColumn } from '@/common/design-system/graphs/proto-flow/flow.columns';
import {
  type ESFieldTypes,
  getMaxNodesPerColumn,
  NUMERIC_FIELD_TYPES,
  NUMERIC_MISSING_SENTINEL,
  resolveAggField,
  transformAggToSankey,
} from '@/common/design-system/graphs/sankey/sankey.utils';
import {
  SankeyChart,
  type SankeyNodeInfo,
} from '@/common/design-system/graphs/sankey/sankey-chart';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { ContextMenuContent } from '@/features/hunt/filtering/query-filters/components/event-value/context-menu/context-menu.content';
import { addQueryFilter } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { useGetThreatsAttackFlowAggregationQuery } from '@/features/hunt/threats/api/threats-attack-flow.api';
import { useGetESMappingQuery } from '@/features/user/settings/settings.api';
import { useAppDispatch } from '@/store/store';

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

function buildAttackFlowAggQuery(
  columns: ProtoColumn[],
  qfilter?: string,
  tenant?: number,
  fieldTypes?: ESFieldTypes,
) {
  const qfilterParts = [
    'event_type:stamus AND NOT stamus.kill_chain:pre_condition',
  ];
  if (qfilter) {
    qfilterParts.push(qfilter);
  }
  if (tenant) {
    qfilterParts.push(`tenant:${tenant}`);
  }

  // Build nested aggs from innermost column to outermost
  let aggs: Record<string, unknown> = {};
  for (let i = columns.length - 1; i >= 0; i--) {
    const col = columns[i];
    const field = resolveAggField(col, fieldTypes);
    const terms: Record<string, unknown> = {
      field,
      size: 100,
    };
    const fieldType = fieldTypes?.[col.key]?.type;
    if (fieldType && NUMERIC_FIELD_TYPES.has(fieldType)) {
      terms.missing = NUMERIC_MISSING_SENTINEL;
    } else if (col.missing) {
      terms.missing = col.missing;
    }
    const colAgg: Record<string, unknown> = { terms };
    if (Object.keys(aggs).length > 0) {
      colAgg.aggs = aggs;
    }
    aggs = { [`col_${i}`]: colAgg };
  }

  return {
    index: 'logstash-*',
    size: 0,
    tenant,
    qfilter: qfilterParts.join(' AND '),
    aggs: {
      aggs: {
        first_seen: { min: { field: '@timestamp' } },
        last_seen: { max: { field: '@timestamp' } },
        ...aggs,
      },
    },
  };
}

export const ThreatsAttackFlowPage = () => {
  const dispatch = useAppDispatch();
  const globalParams = useGlobalQueryParams(['dates', 'tenant', 'qfilter']);
  const { data: esMapping } = useGetESMappingQuery();

  const body = useMemo(
    () =>
      buildAttackFlowAggQuery(
        ATTACK_FLOW_COLUMNS,
        undefined,
        globalParams.tenant,
        esMapping,
      ),
    [globalParams.tenant, esMapping],
  );

  const { data } = useGetThreatsAttackFlowAggregationQuery({
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    body,
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
        dispatch(
          addQueryFilter({ key: 'es_filter', value: `NOT ${col.key}:*` }),
        );
      } else {
        dispatch(addQueryFilter({ key: col.key, value: node.name }));
      }
    },
    [dispatch],
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
