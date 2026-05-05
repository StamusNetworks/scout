import { Binary, Fingerprint, Network, Shapes } from 'lucide-react';

import { Host } from '../../model/host';

export const getBlocks = (host: Host | undefined) => [
  {
    title: 'Roles',
    type: 'default',
    filter: 'host_id.roles.name',
    data: host?.host_id?.roles?.map((role) => ({
      first_seen: new Date(role.first_seen).getTime(),
      last_seen: new Date(role.last_seen).getTime(),
      value: role.name,
    })),
    Icon: Shapes,
  },
  {
    title: 'Hostnames',
    type: 'default',
    filter: 'host_id.hostname.host',
    data: host?.host_id?.hostname?.map((hostname) => ({
      first_seen: new Date(hostname.first_seen).getTime(),
      last_seen: new Date(hostname.last_seen).getTime(),
      value: hostname.host,
    })),
  },
  {
    title: 'Usernames',
    type: 'default',
    filter: 'host_id.username.user',
    data: host?.host_id?.username?.map((username) => ({
      first_seen: new Date(username.first_seen).getTime(),
      last_seen: new Date(username.last_seen).getTime(),
      value: username.user,
    })),
  },
  {
    title: 'Application Layers',
    type: 'default',
    filter: 'host_id.client_service.name',
    Icon: Binary,
    data: host?.host_id?.client_service?.map((service) => ({
      Icon: Network,
      first_seen: new Date(service.first_seen).getTime(),
      last_seen: new Date(service.last_seen).getTime(),
      value: service.name,
    })),
  },
  {
    title: 'HTTP Agents',
    type: 'default',
    filter: 'host_id.http.user_agent.agent',
    data: host?.host_id?.['http.user_agent']?.map((agent) => ({
      first_seen: new Date(agent.first_seen).getTime(),
      last_seen: new Date(agent.last_seen).getTime(),
      value: agent.agent,
    })),
  },
  {
    title: 'Services',
    type: 'expandable',
    filter: 'host_id.service',
    data: host?.host_id?.services?.map((service) => {
      const valid =
        service.values.filter((s) => s.app_proto !== 'unknown')[0] ||
        service.values[0];
      return {
        prefix: valid?.app_proto || 'unknown',
        value: `${service.proto}:${service.port}`,
        first_seen: new Date(valid.first_seen).getTime(),
        last_seen: new Date(valid.last_seen).getTime(),
        expandedItems: [
          {
            key: 'port',
            value: service.port,
            filter: 'host_id.services.port',
          },
          {
            key: 'proto',
            value: service.proto,
            filter: 'host_id.services.proto',
          },
          {
            key: 'app_proto',
            value: valid?.app_proto || 'unknown',
            filter: 'host_id.services.values.app_proto',
          },
          {
            key: 'first_seen',
            value: new Date(valid.first_seen).getTime(),
          },
          {
            key: 'last_seen',
            value: new Date(valid.last_seen).getTime(),
          },
        ],
      };
    }),
  },
  {
    title: 'TLS Agents',
    type: 'expandable',
    filter: 'host_id.tls.ja4.agent',
    Icon: Fingerprint,
    data: host?.host_id?.['tls.ja4']?.map((agent) => ({
      prefix: 'ja4',
      value: agent.agent?.length > 0 ? agent.agent.join(', ') : agent.hash,
      first_seen: new Date(agent.first_seen).getTime(),
      last_seen: new Date(agent.last_seen).getTime(),
      expandedItems: [
        ...(agent.agent?.map((agent) => ({
          key: 'agent',
          value: agent,
        })) || []),
        {
          key: 'hash',
          filter: 'host_id.tls.ja4.hash',
          value: agent.hash,
        },
        {
          key: 'first_seen',
          value: new Date(agent.first_seen).getTime(),
        },
        {
          key: 'last_seen',
          value: new Date(agent.last_seen).getTime(),
        },
      ],
    })),
  },
];
