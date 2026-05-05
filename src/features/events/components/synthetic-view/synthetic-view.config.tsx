import { keys } from 'ramda';
import React from 'react';

import { Event } from '@/features/events/model/event';
import { KillchainTag } from '@/features/threats';
import { ThreatTag } from '@/features/threats';

type SyntheticViewValue = string | number | React.ReactNode;

interface SyntheticViewItem {
  key: string;
  value: SyntheticViewValue | SyntheticViewItem[][] | undefined;
}
interface SyntheticViewProps {
  title: string;
  span?: number;
  valid?: (row: Event) => boolean;
  items: SyntheticViewItem[];
}

export const getSyntheticView = (row: Event): SyntheticViewProps[] => [
  {
    title: 'Detection Method',
    items: [
      { key: 'alert.signature', value: row.alert?.signature },
      { key: 'alert.signature_id', value: row.alert?.signature_id },
      { key: 'alert.category', value: row.alert?.category },
      { key: 'alert.severity', value: row.alert?.severity },
      { key: 'alert.rev', value: row.alert?.rev },
      { key: 'alert.tag', value: row.alert?.tag },
    ],
  },
  {
    title: 'Detection method metadata',
    valid: (row) => row.event_type !== 'stamus' && row.event_type === 'alert',
    items: Object.entries(row.alert?.metadata || {}).map((field) => {
      const value =
        field[1] === null
          ? ''
          : typeof field[1] === 'string'
            ? field[1]
            : field[1].join(', ');
      const key = field[0] === null ? '' : field[0];
      // Filter name in case of not yet defined filter in queryFiters.definitions.tsx
      // const fieldName = key.length > 0 ? key[0].toUpperCase() + key.slice(1).replace('_', ' ') : '';
      return {
        key: `alert.metadata.${key}`,
        value,
      };
    }),
  },
  {
    title: 'Stamus Method',
    valid: (row) => row.event_type === 'stamus',
    items: [
      { key: 'stamus.asset', value: row.stamus?.asset },
      { key: 'stamus.source', value: row.stamus?.source },
      { key: 'stamus.family_name', value: row.stamus?.family_name },
      {
        key: 'stamus.threat_name',
        value: row.stamus?.threat_id ? (
          <div className="overflow-hidden">
            <ThreatTag threat_id={row.stamus?.threat_id} />
          </div>
        ) : (
          row.stamus?.threat_name
        ),
      },
      {
        key: 'stamus.kill_chain',
        value: row.stamus?.kill_chain && (
          <KillchainTag kc={row.stamus?.kill_chain} />
        ),
      },
      { key: 'stamus.threat_id', value: row.stamus?.threat_id },
    ],
  },
  {
    title: 'Sightings',
    items: [
      {
        key: 'discovery.asset_role',
        value: row.discovery?.asset_role?.map((value) => [
          {
            key: 'discovery.asset_role',
            value,
          },
        ]),
      },
      { key: 'discovery.key', value: row.discovery?.key },
      { key: 'discovery.asset', value: row.discovery?.asset },
      { key: 'discovery.value', value: row.discovery?.value },
      { key: 'discovery.asset_net', value: row.discovery?.asset_net },
    ],
  },
  {
    title: 'DNS',
    span: 4,
    valid: (row) => !!row.dns,
    items: getDnsData(row),
  },
  {
    title: 'HTTP',
    span: 4,
    items: [
      { key: 'http.hostname', value: row.http?.hostname },
      { key: 'http.url', value: row.http?.url },
      { key: 'http.status', value: row.http?.status },
      { key: 'http.http_method', value: row.http?.http_method },
      { key: 'http.http_user_agent', value: row.http?.http_user_agent },
      { key: 'http.http_refer', value: row.http?.http_refer },
      { key: 'http.http_port', value: row.http?.http_port },
      { key: 'http.http_content_type', value: row.http?.http_content_type },
      { key: 'http.length', value: row.http?.length },
      { key: 'http.server', value: row.http?.server },
      { key: 'http.accept_language', value: row.http?.accept_language },
      { key: 'http.protocol', value: row.http?.protocol },
    ],
  },
  {
    title: 'TLS',
    span: 4,
    items: [
      { key: 'tls.sni', value: row.tls?.sni },
      { key: 'tls.version', value: row.tls?.version },
      { key: 'tls.cipher_suite', value: row.tls?.cipher_suite },
      { key: 'tls.cipher_security', value: row.tls?.cipher_security },
      { key: 'tls.ja3.hash', value: row.tls?.ja3?.hash },
      {
        key: 'tls.ja3.agent',
        value: row.tls?.ja3?.agent?.map((value) => [
          {
            key: 'tls.ja3.agent',
            value,
          },
        ]),
      },
      { key: 'tls.ja3s.hash', value: row.tls?.ja3s?.hash },
      { key: 'tls.ja4', value: row.tls?.ja4 },
      {
        key: 'tls.alpn_ts',
        value: row.tls?.alpn_ts?.map((value) => [
          { key: 'tls.alpn_ts', value },
        ]),
      },
      { key: 'tls.alpn_tc', value: row.tls?.alpn_tc },
    ],
  },
  {
    title: 'X509',
    span: 4,
    items: [
      { key: 'tls.subject', value: row.tls?.subject },
      { key: 'tls.issuerdn', value: row.tls?.issuerdn },
      { key: 'tls.notbefore', value: row.tls?.notbefore },
      { key: 'tls.notafter', value: row.tls?.notafter },
      { key: 'tls.fingerprint', value: row.tls?.fingerprint },
    ],
  },
  {
    title: 'SMTP',
    items: [
      { key: 'smtp.mail_from', value: row.smtp?.mail_from },
      {
        key: 'smtp.rcpt_to',
        value: row.smtp?.rcpt_to?.map((value) => [
          { key: 'smtp.rcpt_to', value },
        ]),
      },
      { key: 'smtp.helo', value: row.smtp?.helo },
    ],
  },
  {
    title: 'SSH',
    items: [
      {
        key: 'ssh.client.software_version',
        value: row.ssh?.client?.software_version,
      },
      {
        key: 'ssh.client.proto_version',
        value: row.ssh?.client?.proto_version,
      },
      {
        key: 'ssh.client.hassh.hash',
        value: row.ssh?.client?.hassh?.hash,
      },
      {
        key: 'ssh.client.hassh.string',
        value: row.ssh?.client?.hassh?.string,
      },
      {
        key: 'ssh.server.software_version',
        value: row.ssh?.server?.software_version,
      },
      {
        key: 'ssh.server.proto_version',
        value: row.ssh?.server?.proto_version,
      },
      {
        key: 'ssh.server.hassh.hash',
        value: row.ssh?.server?.hassh?.hash,
      },
      {
        key: 'ssh.server.hassh.string',
        value: row.ssh?.server?.hassh?.string,
      },
    ],
  },
  {
    title: 'SMB',
    valid: (row) => !!row.smb && keys(row.smb).length > 0,
    items: [
      { key: 'smb.command', value: row.smb?.command },
      { key: 'smb.status', value: row.smb?.status },
      { key: 'smb.dcerpc.endpoint', value: row.smb?.dcerpc?.endpoint },
      { key: 'smb.filename', value: row.smb?.filename },
      { key: 'smb.share', value: row.smb?.share },
      { key: 'smb.session_id', value: row.smb?.session_id },
      { key: 'smb.id', value: row.smb?.id },
      { key: 'tx_id', value: row.tx_id },
    ],
  },
  {
    title: 'IP and basic information',
    items: [
      { key: 'net_info.src_agg', value: row.net_info?.src_agg },
      { key: 'src_ip', value: row.src_ip },
      { key: 'src_port', value: row.src_port },
      { key: 'net_info.dest_agg', value: row.net_info?.dest_agg },
      { key: 'dest_ip', value: row.dest_ip },
      { key: 'dest_port', value: row.dest_port },
      { key: 'alert.xff', value: row.alert?.xff },
      { key: 'proto', value: row.proto },
      { key: 'app_proto', value: row.app_proto },
      { key: 'app_proto_orig', value: row.app_proto_orig },
      { key: 'host', value: row.host },
      {
        key: 'vlan',
        value: row.vlan?.map((v) => [{ key: 'vlan', value: v }]),
      },
    ],
  },
  {
    title: 'Flow',
    items: [
      { key: 'flow.start', value: row.flow?.start },
      { key: 'flow.src_ip', value: row.flow?.src_ip },
      { key: 'flow.dest_ip', value: row.flow?.dest_ip },
      { key: 'flow.bytes_toserver', value: row.flow?.bytes_toserver },
      { key: 'flow.bytes_toclient', value: row.flow?.bytes_toclient },
      { key: 'flow.pkts_toserver', value: row.flow?.pkts_toserver },
      { key: 'flow.pkts_toclient', value: row.flow?.pkts_toclient },
      { key: 'flow.age', value: row.flow?.age },
      { key: 'flow.tx_cnt', value: row.flow?.tx_cnt },
      { key: 'flow_id', value: row.flow_id },
      { key: 'community_id', value: row.community_id },
    ],
  },
  {
    title: 'Geo IP',
    items: [
      { key: 'geoip.country_name', value: row.geoip?.country_name },
      { key: 'geoip.country.iso_code', value: row.geoip?.country?.iso_code },
      {
        key: 'geoip.provider.autonomous_system_number',
        value: row.geoip?.provider?.autonomous_system_number,
      },
      {
        key: 'geoip.provider.autonomous_system_organization',
        value: row.geoip?.provider?.autonomous_system_organization,
      },
    ],
  },
  {
    title: 'Enrichment',
    items: [
      { key: 'alert.source.ip', value: row.alert?.source?.ip },
      { key: 'alert.source.port', value: row.alert?.source?.port },
      { key: 'alert.target.ip', value: row.alert?.target?.ip },
      { key: 'alert.target.port', value: row.alert?.target?.port },
    ],
  },
  {
    title: 'Tunnel',
    valid: (row) => !!row.tunnel,
    items: [
      { key: 'tunnel.src_ip', value: row.tunnel?.src_ip },
      { key: 'tunnel.dest_ip', value: row.tunnel?.dest_ip },
      { key: 'tunnel.proto', value: row.tunnel?.proto },
      { key: 'tunnel.depth', value: row.tunnel?.depth },
    ],
  },
  {
    title: 'Ethernet',
    items: [
      {
        key: 'ether.src_mac',
        value: row.ether?.src_mac,
      },
      {
        key: 'ether.dest_mac',
        value: row.ether?.dest_mac,
      },
      { key: 'in_iface', value: row.in_iface },
    ],
  },
];

const getDnsData = (row: Event) => {
  if (row.event_type === 'dns') {
    return [
      {
        key: 'dns.rrname',
        value: row.dns?.rrname,
      },
      {
        key: 'dns.rrtype',
        value: row.dns?.rrtype,
      },
      {
        key: 'dns.type',
        value: row.dns?.type,
      },
    ];
  }

  return [
    {
      key: 'dns.query',
      value:
        row.dns?.version === 2
          ? row.dns?.query?.map((v) => [
              { key: 'dns.query.rrname', value: v.rrname },
              { key: 'dns.query.rrtype', value: v.rrtype },
            ])
          : row.dns?.version === 3
            ? row.dns?.queries?.map((v) => [
                { key: 'dns.queries.rrname', value: v.rrname },
                { key: 'dns.queries.rrtype', value: v.rrtype },
              ])
            : [],
    },
    {
      key: 'dns.answer',
      value:
        row.dns?.version === 2
          ? row.dns?.answer?.map((v) => [
              { key: 'dns.answer.rrname', value: v.rrname },
              { key: 'dns.answer.rrtype', value: v.rrtype },
            ])
          : row.dns?.version === 3
            ? row.dns?.answers?.map((v) => [
                { key: 'dns.answers.rrname', value: v.rrname },
                { key: 'dns.answers.rrtype', value: v.rrtype },
              ])
            : [],
    },
  ];
};
