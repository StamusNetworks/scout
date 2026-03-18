import { compressIPv6, isIPv6 } from '@/common/lib/ips';

import { Entity } from '../../entity';

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

export const formatForcegraph = (data: Entity[]) => {
  const nodes: Node[] = [];
  const links: Link[] = [];

  data.forEach((entity) => {
    // Add entity node if it doesn't exist
    if (!nodes.find((node) => node.id === entity.value)) {
      nodes.push({
        id: entity.pk.toString(),
        type: 'entity',
        value: isIPv6(entity.value) ? compressIPv6(entity.value) : entity.value,
        color: 'foreground',
      });
    }

    // Add threat nodes and links for each threat
    entity.threats.forEach((threat) => {
      const threatNodeId = `threat-${threat.threat__threat_id}`;

      // Add threat node if it doesn't exist
      if (!nodes.find((node) => node.id === threatNodeId)) {
        nodes.push({
          id: threatNodeId,
          type: threat.kill_chain === -1 ? 'policy_violation' : 'threat',
          threatId: threat.threat__threat_id,
          value: threat.threat__name,
          color: 'destructive',
        });
      }

      // Add link between entity and threat
      links.push({
        source: threatNodeId,
        target: entity.pk.toString(),
      });
    });
  });
  return { nodes, links };
};
