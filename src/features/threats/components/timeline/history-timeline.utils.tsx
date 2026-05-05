import { Host } from '@/features/host-insights/model/host';
import { KillChainPhase } from '@/features/threats/model/kill-chain';

import { ThreatHistory } from '../../model/threat-history';

interface BaseHistoryItem {
  timestamp: number;
}

export interface Ja4HistoryItem extends BaseHistoryItem {
  type: 'ja4';
  hash: string;
  values: string[];
}

export interface UserAgentHistoryItem extends BaseHistoryItem {
  type: 'user_agent';
  value: string;
}

export interface ThreatHistoryItem extends BaseHistoryItem {
  type: 'threat';
  values: {
    threat_id: string;
    step: KillChainPhase;
    is_offender: boolean;
  };
}

export interface UsernameHistoryItem extends BaseHistoryItem {
  type: 'username';
  value: string;
}

export interface HostnameHistoryItem extends BaseHistoryItem {
  type: 'hostname';
  value: string;
}

export interface ServiceHistoryBaseItem extends BaseHistoryItem {
  type: 'service';
  proto: string;
  port: number;
  app_proto: string;
}
export interface TLSServiceHistoryItem extends ServiceHistoryBaseItem {
  app_proto: 'tls';
  tls: {
    cn?: string;
    fingerprint?: string;
    issuerdn?: string;
    notafter?: string;
    notbefore?: string;
    serial?: string;
    subject?: string;
  };
}
export interface HTTPServiceHistoryItem extends ServiceHistoryBaseItem {
  app_proto: 'http';
  http: {
    server?: string;
  };
}

export interface SSHServiceHistoryItem extends ServiceHistoryBaseItem {
  app_proto: 'http';
  ssh: {
    software_version?: string;
  };
}

export type ServiceHistoryItem =
  | ServiceHistoryBaseItem
  | TLSServiceHistoryItem
  | HTTPServiceHistoryItem
  | SSHServiceHistoryItem;

export type HistoryItem =
  | Ja4HistoryItem
  | UserAgentHistoryItem
  | ThreatHistoryItem
  | UsernameHistoryItem
  | HostnameHistoryItem
  | ServiceHistoryItem;

const formatJa4History = (
  ja4s: Host['host_id']['tls.ja4'] | undefined,
): HistoryItem[] =>
  ja4s?.map(({ agent, hash, first_seen }) => ({
    timestamp: new Date(first_seen).getTime(),
    type: 'ja4',
    hash,
    values: agent,
  })) || [];

const formatUserAgentHistory = (
  userAgents: Host['host_id']['http.user_agent'] | undefined,
): HistoryItem[] =>
  userAgents?.map(({ agent, first_seen }) => ({
    timestamp: new Date(first_seen).getTime(),
    type: 'user_agent',
    value: agent,
  })) || [];

const formatThreatHistory = (
  threatHistory: ThreatHistory['history'] | undefined,
): HistoryItem[] =>
  threatHistory
    ?.filter((tH) => tH.history_type === 'first_seen')
    .map(({ timestamp, params, threat_id }) => ({
      timestamp: new Date(timestamp).getTime(),
      type: 'threat',
      values: {
        threat_id,
        step: params.step_kill_chain,
        is_offender: !!params.step_kill_chain_offender,
      },
    })) || [];

const formatUsernameHistory = (
  usernames: Host['host_id']['username'] | undefined,
): UsernameHistoryItem[] =>
  usernames?.map(({ user, first_seen }) => ({
    timestamp: new Date(first_seen).getTime(),
    type: 'username',
    value: user,
  })) || [];

const formatHostnameHistory = (
  hostnames: Host['host_id']['hostname'] | undefined,
): HostnameHistoryItem[] =>
  hostnames?.map(({ host, first_seen }) => ({
    timestamp: new Date(first_seen).getTime(),
    type: 'hostname',
    value: host,
  })) || [];

export const formatServiceHistory = (
  services: Host['host_id']['services'] | undefined,
): ServiceHistoryItem[] => {
  if (!services) return [];
  return services.flatMap(({ proto, port, values }) =>
    values.map((value) => {
      const { app_proto, first_seen, http } = value;
      const { tls, ssh } = value as typeof value & {
        tls?: TLSServiceHistoryItem['tls'];
        ssh?: SSHServiceHistoryItem['ssh'];
      };
      return {
        proto,
        port,
        timestamp: new Date(first_seen).getTime(),
        type: 'service',
        app_proto,
        ...(http && { http }),
        ...(tls && { tls }),
        ...(ssh && { ssh }),
      } as ServiceHistoryItem;
    }),
  );
};

export const computeHistory = ({
  host_id,
  threatHistory,
}: {
  host_id: Host['host_id'] | undefined;
  threatHistory: ThreatHistory['history'] | undefined;
}) =>
  [
    ...formatJa4History(host_id?.['tls.ja4']),
    ...formatUserAgentHistory(host_id?.['http.user_agent']),
    ...formatThreatHistory(threatHistory),
    ...formatUsernameHistory(host_id?.username),
    ...formatHostnameHistory(host_id?.hostname),
    ...formatServiceHistory(host_id?.services),
  ].sort((a, b) => a.timestamp - b.timestamp);
