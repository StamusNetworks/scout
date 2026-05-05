import { compressIPv6, isIPv6 } from '@/common/lib/ips';

import { ImpactedEntity } from '../../model/impacted-entity';

export type Node = {
  id: string;
  value: string;
  color: string;
} & (
  | {
      type: 'entity';
    }
  | {
      type: 'threat';
      threatId: number;
    }
  | {
      type: 'policy_violation';
      threatId: number;
    }
);
export type Link = {
  source: string;
  target: string;
};
export type ForceGraphData = {
  nodes: Node[];
  links: Link[];
};

export const formatForcegraph = (data: ImpactedEntity[]) => {
  const nodes: Node[] = [];
  const links: Link[] = [];

  data.forEach((entity) => {
    // Add entity node if it doesn't exist
    if (!nodes.find((node) => node.id === entity.value)) {
      nodes.push({
        id: entity.id.toString(),
        type: 'entity',
        value: isIPv6(entity.value) ? compressIPv6(entity.value) : entity.value,
        color: 'foreground',
      });
    }

    // Add threat nodes and links for each threat
    entity.threats.forEach((threat) => {
      const threatNodeId = `threat-${threat.threatId}`;

      // Add threat node if it doesn't exist
      if (!nodes.find((node) => node.id === threatNodeId)) {
        nodes.push({
          id: threatNodeId,
          type:
            threat.phase === 'pre_condition' ? 'policy_violation' : 'threat',
          threatId: threat.threatId,
          value: threat.name,
          color: 'destructive',
        });
      }

      // Add link between entity and threat
      links.push({
        source: threatNodeId,
        target: entity.id.toString(),
      });
    });
  });
  return { nodes, links };
};
