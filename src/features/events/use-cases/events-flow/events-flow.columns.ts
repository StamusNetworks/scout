import { Event } from '@/features/hunt/events/model/event.schema';

export type ProtoColumn<T = unknown> = {
  title: string;
  key: string;
  missing: string;
  valFunc?: (ev: T) => string | undefined;
  aggField?: string;
};

const offenderCol = {
  title: 'Offender',
  key: 'stamus.source',
  missing: 'Missing offender',
};

export const JA3Col: ProtoColumn<Event> = {
  title: 'JA3',
  key: 'tls.ja3',
  valFunc: (ev) => {
    if ('tls' in ev && ev.tls && ev.tls.ja3) {
      if (
        ev.tls.ja3.agent &&
        ev.tls.ja3.agent.length > 0 &&
        ev.tls.ja3.agent[0]
      ) {
        return ev.tls.ja3.agent[0];
      }
      return ev.tls.ja3.hash;
    }
    return undefined;
  },
  missing: 'Missing hash',
};

const protoColumns: Record<string, ProtoColumn<Event>[]> = {
  default: [offenderCol],

  // Homoglyphs, etc.
  code: [
    {
      title: 'Extra info',
      key: 'stamus.extra_info',
      missing: 'N/A',
    },
  ],

  smb: [
    {
      title: 'DCERPC Interface',
      key: 'smb.dcerpc.interface.name',
      missing: 'N/A',
      valFunc: (ev) =>
        'smb' in ev
          ? ev.smb?.dcerpc?.interface?.name ||
            ev.smb?.dcerpc?.interfaces?.[0]?.name
          : undefined,
    },
    {
      title: 'DCERPC Endpoint',
      key: 'smb.dcerpc.endpoint',
      missing: 'N/A',
    },
    {
      title: 'Command',
      key: 'smb.command',
      missing: 'N/A',
    },
    {
      title: 'Status',
      key: 'smb.status',
      missing: 'N/A',
    },
  ],

  tls: [
    {
      title: 'JA4',
      key: 'tls.ja4',
      missing: 'N/A',
    },
    {
      title: 'SNI',
      key: 'tls.sni',
      missing: 'N/A',
    },
    {
      title: 'Subject DN',
      key: 'tls.subject',
      missing: 'N/A',
    },
    {
      title: 'Issuer DN',
      key: 'tls.issuerdn',
      missing: 'N/A',
    },
    {
      title: 'Version',
      key: 'tls.version',
      missing: 'N/A',
    },
    {
      title: 'ALPN',
      key: 'tls.alpn_tc',
      missing: 'N/A',
    },
  ],

  http: [
    {
      title: 'User agent',
      key: 'http.http_user_agent',
      missing: 'N/A',
    },
    {
      title: 'Hostname',
      key: 'http.hostname',
      missing: 'N/A',
    },
    {
      title: 'Method',
      key: 'http.http_method',
      missing: 'N/A',
    },
    {
      title: 'URL',
      key: 'http.url',
      missing: 'N/A',
    },
    {
      title: 'Status',
      key: 'http.status',
      missing: 'N/A',
    },
  ],

  dns: [
    {
      title: 'Rrname',
      key: 'dns.query.rrname',
      missing: 'N/A',
    },
    {
      title: 'Rrtype',
      key: 'dns.query.rrtype',
      missing: 'N/A',
    },
    {
      title: 'Protocol',
      key: 'proto',
      missing: 'N/A',
    },
  ],

  snmp: [
    {
      title: 'Community',
      key: 'snmp.community',
      missing: 'N/A',
    },
    {
      title: 'Pdu type',
      key: 'snmp.pdu_type',
      missing: 'N/A',
    },
    {
      title: 'Vars',
      key: 'snmp.vars',
      missing: 'N/A',
      valFunc: (ev) => ('snmp' in ev ? ev.snmp?.vars?.join(', ') : undefined),
    },
    {
      title: 'Version',
      key: 'snmp.version',
      missing: 'N/A',
    },
  ],

  sip: [
    {
      title: 'Version',
      key: 'sip.version',
      missing: 'N/A',
    },
    {
      title: 'Method',
      key: 'sip.method',
      missing: 'N/A',
    },
    {
      title: 'URI',
      key: 'sip.uri',
      missing: 'N/A',
    },
  ],
};

export default protoColumns;
