import type { ProtoColumn } from '@/common/design-system/graphs/proto-flow/flow.columns';
import {
  type ESFieldTypes,
  NUMERIC_FIELD_TYPES,
  NUMERIC_MISSING_SENTINEL,
  resolveAggField,
} from '@/common/design-system/graphs/sankey/sankey.utils';

export {
  extractTimestamps,
  getMaxNodesPerColumn,
  transformAggToSankey,
} from '@/common/design-system/graphs/sankey/sankey.utils';

/**
 * Builds a nested ES terms aggregation query body for the Sankey flow chart.
 * Columns are iterated in reverse to build inside-out nested aggs.
 */
export function buildSignatureFlowAggQuery(
  appProto: string,
  columns: ProtoColumn[],
  qfilter?: string,
  tenant?: number,
  fieldTypes?: ESFieldTypes,
) {
  const qfilterParts = [];
  if (appProto !== 'default') {
    qfilterParts.push(`app_proto:${appProto}`);
  }
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

/**
 * Builds an ES terms aggregation query to discover which app_proto values
 * exist for a given signature.
 */
export function buildSignatureFlowProtocolsQuery(
  sid: number,
  qfilter?: string,
  tenant?: number,
) {
  const qfilterParts = [`alert.signature_id:${sid}`];
  if (qfilter) {
    qfilterParts.push(qfilter);
  }
  if (tenant) {
    qfilterParts.push(`tenant:${tenant}`);
  }

  return {
    index: 'logstash-*',
    size: 0,
    tenant,
    qfilter: qfilterParts.join(' AND '),
    aggs: {
      aggs: {
        protocols: {
          terms: {
            field: 'app_proto.keyword',
            size: 20,
          },
        },
      },
    },
  };
}
