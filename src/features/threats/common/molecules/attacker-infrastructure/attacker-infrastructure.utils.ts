import { compressIPv6, isIPv6 } from '@/common/lib/ips';
import { esEscape } from '@/common/lib/strings';
import { KillChainStepsEnum } from '@/features/query-filters/constants/query-filter.config';

import { AttackerInfrastructureAggregation } from './attacker-infrastructure.schema';

export type Node = {
  id: string;
  group: number;
  type: 'killchain' | 'method' | 'entity' | 'host';
  value: number;
  color: string;
  label?: string;
};
export type Link = {
  source: string;
  target: string;
  value: number;
};
export type ForceGraphData = {
  nodes: Node[];
  links: Link[];
};

export const formatForcegraph = (
  agg: AttackerInfrastructureAggregation['aggregations'],
) => {
  const nodes: Node[] = [];
  const links: Link[] = [];
  if (!Object.keys(agg).length) return { nodes, links };
  agg[2].buckets.forEach((killChain) => {
    nodes.push({
      id: killChain.key,
      group: 1,
      type: 'killchain',
      label:
        KillChainStepsEnum[killChain.key as keyof typeof KillChainStepsEnum],
      value: 1000,
      color: killChain.key,
    });
    killChain[3].buckets.forEach((signature) => {
      if (nodes.filter((node) => node.id === signature.key).length === 0) {
        nodes.push({
          id: signature.key,
          type: 'method',
          group: 2,
          label: signature.key,
          value: 1000,
          color: 'muted-foreground',
        });
      }
      links.push({
        source: signature.key,
        target: killChain.key,
        value: 1,
      });
      signature[4].buckets.forEach((source) => {
        if (nodes.filter((node) => node.id === source.key).length === 0) {
          nodes.push({
            id: source.key,
            type: 'entity',
            group: 3,
            label: isIPv6(source.key) ? compressIPv6(source.key) : source.key,
            value: 1000,
            color: 'primary',
          });
        }
        links.push({
          source: source.key,
          target: signature.key,
          value: 1000,
        });
        source[5].buckets.forEach((host) => {
          if (nodes.filter((node) => node.id === host.key).length === 0) {
            nodes.push({
              id: host.key,
              type: 'host',
              group: 4,
              label: host.key,
              value: 1000,
              color: 'primary',
            });
          }
          links.push({
            source: host.key,
            target: source.key,
            value: 1000,
          });
        });
      });
    });
  });
  return { nodes, links };
};

export const getESParams = (entity: string) => ({
  index: 'logstash-stamus-*',
  size: 0,
  qfilter: `stamus.asset:${esEscape(entity)} AND (NOT stamus.kill_chain.keyword: pre_condition)`,
  aggs: {
    aggs: {
      2: {
        terms: {
          field: 'stamus.kill_chain.keyword',
          order: {
            _count: 'desc',
          },
          size: 10,
        },
        aggs: {
          3: {
            terms: {
              field: 'alert.signature.keyword',
              order: {
                _count: 'desc',
              },
              size: 10,
            },
            aggs: {
              4: {
                terms: {
                  field: 'stamus.source.keyword',
                  order: {
                    _count: 'desc',
                  },
                  size: 10,
                },
                aggs: {
                  5: {
                    terms: {
                      field: 'hostname_info.host.keyword',
                      order: {
                        _count: 'desc',
                      },
                      size: 10,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
