import type { ProtoColumn } from '@/common/design-system/graphs/proto-flow/flow.columns';
import type { SankeyChartData } from '@/common/design-system/graphs/sankey/sankey-chart';

type AggBucket = {
  key: string | number;
  doc_count: number;
  [nested: string]: unknown;
};

type AggLevel = {
  buckets: AggBucket[];
};

export type ESFieldTypes = Record<string, { type: string }>;

export const NUMERIC_MISSING_SENTINEL = -1031239;

export const NUMERIC_FIELD_TYPES = new Set([
  'byte',
  'short',
  'integer',
  'long',
  'double',
  'float',
  'half_float',
  'scaled_float',
]);

/**
 * Resolves the ES aggregation field for a column.
 * Appends `.keyword` only for `text` fields; other types (keyword, ip, long, etc.)
 * are used as-is.
 */
export function resolveAggField(
  col: ProtoColumn,
  fieldTypes?: ESFieldTypes,
): string {
  if (col.aggField) return col.aggField;
  const fieldType = fieldTypes?.[col.key]?.type;
  if (fieldType === 'text') return `${col.key}.keyword`;
  return col.key;
}

/**
 * Transforms nested ES aggregation buckets into recharts-compatible Sankey data.
 * Also collects complete root-to-leaf paths so that path highlighting
 * can distinguish branches that share an intermediate node.
 */
export function transformAggToSankey(
  aggResponse: Record<string, unknown>,
  columns: ProtoColumn[],
  fieldTypes?: ESFieldTypes,
): SankeyChartData {
  const nodes: SankeyChartData['nodes'] = [];
  const links: SankeyChartData['links'] = [];
  const paths: number[][] = [];

  // Map to track unique nodes: `columnIndex::bucketKey` -> node index
  const nodeMap = new Map<string, number>();

  function getOrCreateNode(
    columnIndex: number,
    bucketKey: string,
    docCount: number,
  ): number {
    const nodeKey = `${columnIndex}::${bucketKey}`;
    if (nodeMap.has(nodeKey)) {
      const idx = nodeMap.get(nodeKey)!;
      nodes[idx].value += docCount;
      return idx;
    }
    const index = nodes.length;
    nodes.push({
      name: bucketKey,
      value: docCount,
      columnIndex,
      columnTitle: columns[columnIndex]?.title,
    });
    nodeMap.set(nodeKey, index);
    return index;
  }

  function walkBuckets(
    agg: AggLevel,
    columnIndex: number,
    parentNodeIndex: number | undefined,
    currentPath: number[],
  ) {
    agg.buckets.forEach((bucket) => {
      const col = columns[columnIndex];
      const ft = fieldTypes?.[col?.key]?.type;
      const isSentinel =
        ft &&
        NUMERIC_FIELD_TYPES.has(ft) &&
        Number(bucket.key) === NUMERIC_MISSING_SENTINEL;
      const displayKey = isSentinel
        ? (col?.missing ?? 'N/A')
        : String(bucket.key);

      const nodeIndex = getOrCreateNode(
        columnIndex,
        displayKey,
        bucket.doc_count,
      );
      const pathSoFar = [...currentPath, nodeIndex];

      if (parentNodeIndex != null) {
        // Check if this link already exists and merge values
        const existingLink = links.find(
          (l) => l.source === parentNodeIndex && l.target === nodeIndex,
        );
        if (existingLink) {
          existingLink.value += bucket.doc_count;
        } else {
          links.push({
            source: parentNodeIndex,
            target: nodeIndex,
            value: bucket.doc_count,
          });
        }
      }

      // Recurse into next column's nested agg
      const nextColKey = `col_${columnIndex + 1}`;
      const nextAgg = bucket[nextColKey] as AggLevel | undefined;
      if (nextAgg?.buckets?.length) {
        walkBuckets(nextAgg, columnIndex + 1, nodeIndex, pathSoFar);
      } else {
        // Leaf: record the complete path
        paths.push(pathSoFar);
      }
    });
  }

  // Start at col_0
  const rootAgg = aggResponse.col_0 as AggLevel | undefined;
  if (rootAgg?.buckets) {
    walkBuckets(rootAgg, 0, undefined, []);
  }

  return { nodes, links, paths };
}

/**
 * Builds a nested ES terms aggregation for a Sankey flow chart.
 * Columns are iterated in reverse to produce inside-out nested aggs.
 */
export function buildFlowAggQuery(
  columns: ProtoColumn[],
  fieldTypes?: ESFieldTypes,
): Record<string, unknown> {
  let aggs: Record<string, unknown> = {};
  for (let i = columns.length - 1; i >= 0; i--) {
    const col = columns[i];
    const field = resolveAggField(col, fieldTypes);
    const terms: Record<string, unknown> = { field, size: 100 };
    const fieldType = fieldTypes?.[col.key]?.type;
    if (fieldType && NUMERIC_FIELD_TYPES.has(fieldType)) {
      terms.missing = NUMERIC_MISSING_SENTINEL;
    } else if (col.missing) {
      terms.missing = col.missing;
    }
    const colAgg: Record<string, unknown> = { terms };
    if (Object.keys(aggs).length > 0) colAgg.aggs = aggs;
    aggs = { [`col_${i}`]: colAgg };
  }
  return {
    aggs: {
      first_seen: { min: { field: '@timestamp' } },
      last_seen: { max: { field: '@timestamp' } },
      ...aggs,
    },
  };
}

/**
 * Returns the highest node count across all columns in the Sankey data.
 */
export function getMaxNodesPerColumn(data: SankeyChartData): number {
  const counts = new Map<number, number>();
  for (const node of data.nodes) {
    const col = node.columnIndex ?? 0;
    counts.set(col, (counts.get(col) ?? 0) + 1);
  }
  return Math.max(0, ...counts.values());
}

/**
 * Extracts first_seen and last_seen timestamps from the aggregation response.
 */
export function extractTimestamps(aggResponse: Record<string, unknown>): {
  firstSeen?: string;
  lastSeen?: string;
} {
  const firstSeen = (aggResponse.first_seen as { value_as_string?: string })
    ?.value_as_string;
  const lastSeen = (aggResponse.last_seen as { value_as_string?: string })
    ?.value_as_string;
  return { firstSeen, lastSeen };
}
