import { toPairs } from 'ramda';

import { Host } from '../../model/host';

export type TreeNode = {
  id: string;
  label: string;
} & (
  | {
      type: 'network_definition';
      metadata: NetworkDefinitionMetadata;
    }
  | {
      type: 'host';
      metadata: HostMetadata;
    }
);

export type TreeMetadata = {
  max_hostnames_count: number;
  max_usernames_count: number;
  max_roles_count: number;
  max_http_user_agents_count: number;
  max_tls_agents_count: number;
  max_ssh_clients_count: number;
};

export type NetworkDefinitionMetadata = {
  ips_count: number;
  roles_count: number;
  hostnames_count: number;
  usernames_count: number;
};

export type HostMetadata = {
  services_count: number;
  hostnames_count: number;
  usernames_count: number;
  http_user_agents_count: number;
  tls_agents_count: number;
  ssh_clients_count: number;
  roles_count: number;
};

export type TreeLink = {
  source: string;
  target: string;
  value: number;
  type: 'host' | 'network_definition';
};

export const getForceGraphData = (
  hosts: Host[],
): {
  nodes: TreeNode[];
  links: TreeLink[];
  metadata: TreeMetadata;
} => {
  const networks: Record<string, NetworkDefinitionMetadata> = {
    root: {
      ips_count: 0,
      roles_count: 0,
      hostnames_count: 0,
      usernames_count: 0,
    },
  };
  const nodes: TreeNode[] = [];
  const links: TreeLink[] = [];
  const metadata = {
    max_hostnames_count: 0,
    max_usernames_count: 0,
    max_roles_count: 0,
    max_http_user_agents_count: 0,
    max_tls_agents_count: 0,
    max_ssh_clients_count: 0,
  };

  hosts.forEach((host) => {
    metadata.max_hostnames_count = Math.max(
      metadata.max_hostnames_count,
      host.host_id.hostname_count,
    );
    metadata.max_usernames_count = Math.max(
      metadata.max_usernames_count,
      host.host_id.username_count,
    );
    metadata.max_roles_count = Math.max(
      metadata.max_roles_count,
      host.host_id.roles_count,
    );
    metadata.max_http_user_agents_count = Math.max(
      metadata.max_http_user_agents_count,
      host.host_id['http.user_agent_count'],
    );
    metadata.max_tls_agents_count = Math.max(
      metadata.max_tls_agents_count,
      host.host_id['tls.ja4_count'],
    );
    metadata.max_ssh_clients_count = Math.max(
      metadata.max_ssh_clients_count,
      host.host_id.client_service_count,
    );
    // Create host node
    nodes.push({
      id: host.ip,
      label: host.ip,
      type: 'host',
      metadata: {
        roles_count: host.host_id.roles_count,
        hostnames_count: host.host_id.hostname_count,
        usernames_count: host.host_id.username_count,
        tls_agents_count: host.host_id['tls.ja4_count'],
        http_user_agents_count: host.host_id['http.user_agent_count'],
        ssh_clients_count: host.host_id.client_service_count,
        services_count: host.host_id.services_count,
      },
    });
    // Add root node
    networks['root'].ips_count++;
    networks['root'].hostnames_count += host.host_id.hostname_count;
    networks['root'].roles_count += host.host_id.roles_count;
    networks['root'].usernames_count += host.host_id.username_count;
    // Link host to root if no network def
    if (!host.host_id.net_info?.length) {
      links.push({
        source: 'root',
        target: host.ip,
        type: 'host',
        value: 0,
      });
    }

    if (host.host_id.net_info?.length) {
      host.host_id.net_info.forEach((net) => {
        // Link host to it's network def
        links.push({
          source: net.agg,
          target: host.ip,
          type: 'host',
          value: 0,
        });
        getNetNodes(net.agg).forEach((node) => {
          if (!networks[node]) {
            // Create default network def
            networks[node] = {
              ips_count: 1,
              roles_count: host.host_id.roles_count,
              hostnames_count: host.host_id.hostname_count,
              usernames_count: host.host_id.username_count,
            };
            // Link network newly created network defs
            const split = node.split('.');
            links.push({
              source:
                split.length === 1
                  ? 'root'
                  : split.slice(1, split.length).join('.'),
              target: node,
              type: 'network_definition',
              value: 1000,
            });
          } else {
            // Update network def metadata if it exists
            const curr = networks[node];
            networks[node] = {
              ips_count: curr.ips_count + 1,
              roles_count: curr.roles_count + host.host_id.roles_count,
              hostnames_count:
                curr.hostnames_count + host.host_id.hostname_count,
              usernames_count:
                curr.usernames_count + host.host_id.username_count,
            };
          }
        });
      });
    }
  });
  // Create node for each network def with computed metadata
  toPairs(networks).forEach(([node, metadata]) => {
    nodes.push({
      id: node,
      label: node.split('.')[0],
      type: 'network_definition',
      metadata,
    });
  });

  return { nodes, links, metadata };
};

export const getNetNodes = (netdef: string) => {
  const depth = netdef.split('.').length;
  const nodes: string[] = [];
  for (let i = 0; i < depth; i++) {
    nodes.push(netdef.split('.').slice(i, depth).join('.'));
  }
  return nodes;
};
