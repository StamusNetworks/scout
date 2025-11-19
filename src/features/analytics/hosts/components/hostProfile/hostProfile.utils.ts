import { Host } from '../../model/host';

export const getHostProfileChartData = (host: Host | undefined) => [
  {
    label: `Services (${host?.host_id?.services_count || 0})`,
    count: host?.host_id?.services_count || 0,
  },
  {
    label: `TLS Agents (${host?.host_id?.['tls.ja4_count'] || 0})`,
    count: host?.host_id?.['tls.ja4_count'] || 0,
  },
  {
    label: `HTTP User Agents (${host?.host_id?.['http.user_agent_count'] || 0})`,
    count: host?.host_id?.['http.user_agent_count'] || 0,
  },
  {
    label: `Hostnames (${host?.host_id?.hostname_count || 0})`,
    count: host?.host_id?.hostname_count || 0,
  },
  {
    label: `Usernames (${host?.host_id?.username_count || 0})`,
    count: host?.host_id?.username_count || 0,
  },
];
