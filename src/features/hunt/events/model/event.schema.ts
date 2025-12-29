import { z } from 'zod';

import { hostnameInfoSchema } from './enrichments/hostnameInfo.schema';
import { anomalySchema } from './event-types/anomaly.schema';
import { fileInfoSchema } from './event-types/fileinfo.schema';
import { smbSchema } from './event-types/smb.schema';
import { snmpSchema } from './event-types/snmp.schema';
import { stamusSchema } from './event-types/stamus.schema';

export const eventSchema = z.object({
  '@timestamp': z.string(),
  capture_file: z.string().optional(),
  log: z.object({
    file: z.object({
      path: z.string(),
      offset: z.number(),
    }),
    offset: z.number(),
  }),
  direction: z.enum(['to_server', 'to_client']),
  dest_ip: z.string(),
  app_proto: z.string(),
  tags: z.array(z.string()),
  logger: z.string(),
  flow_id: z.string(),
  flow: z.object({
    age: z.number().optional(),
    tx_cnt: z.number().optional(),
    pkts_toserver: z.number(),
    start: z.string(),
    end: z.string(),
    dest_ip: z.string(),
    src_ip: z.string(),
    bytes_toserver: z.number(),
    bytes_toclient: z.number(),
    src_port: z.number(),
    pkts_toclient: z.number(),
    dest_port: z.number(),
  }),
  event_type: z.union([
    z.literal('alert'),
    z.literal('stamus'),
    z.literal('flow'),
    z.literal('dns'),
    z.literal('fileinfo'),
    z.literal('anomaly'),
    z.literal('smb'),
    z.literal('tls'),
    z.literal('http'),
    z.literal('dcerpc'),
    z.literal('dhcp'),
    z.literal('rdp'),
    z.literal('sip'),
    z.literal('smtp'),
    z.literal('ssh'),
    z.literal('tftp'),
    z.literal('tls'),
    z.literal('ftp'),
    z.literal('ftp_data'),
    z.literal('krb5'),
    z.literal('mqtt'),
    z.literal('netflow'),
    z.literal('nfs'),
    z.literal('rfb'),
    z.literal('snmp'),
  ]),
  alerted: z.boolean(),
  timestamp: z.string(),
  host: z.string(),
  alert: z.object({
    source: z.object({
      net_info_agg: z.string(),
      ip: z.string(),
      net_info: z.array(z.string()),
      port: z.number(),
    }),
    category: z.string(),
    gid: z.number(),
    rev: z.number(),
    lateral: z.string(),
    metadata: z.object({
      lateral_function: z.array(z.string()),
      updated_at: z.array(z.string()),
      provider: z.array(z.string()),
      source: z.array(z.string()),
      lateral_asset: z.array(z.string()),
      lateral_key: z.array(z.string()),
      signature_severity: z.array(z.string()),
      created_at: z.array(z.string()),
      stamus_classification: z.array(z.string()),
      mitre_tactic_name: z.string().optional(),
      mitre_tactic_id: z.string().optional(),
      mitre_technique_name: z.string().optional(),
      mitre_technique_id: z.string().optional(),
    }),
    signature: z.string(),
    action: z.string(),
    target: z.object({
      net_info_agg: z.string(),
      ip: z.string(),
      net_info: z.array(z.string()),
      port: z.number(),
    }),
    signature_id: z.number(),
    severity: z.number(),
    tag: z
      .union([z.literal('informational'), z.literal('relevant')])
      .optional(),
    xff: z.string(),
  }),
  metadata: z.object({
    flowbits: z.array(z.string()),
  }),
  net_info: z.object({
    src_agg: z.string(),
    dest_agg: z.string(),
  }),
  src_ip: z.string(),
  src_port: z.number(),
  dest_port: z.number(),
  proto: z.string(),
  app_proto_orig: z.string(),
  in_iface: z.string(),
  vlan: z.array(z.number()),
  tunnel: z.object({
    src_ip: z.string(),
    dest_ip: z.string(),
    proto: z.string(),
    depth: z.string(),
  }),
  dns: z.discriminatedUnion('version', [
    z.object({
      version: z.literal(2),
      query: z
        .array(
          z.object({
            id: z.number(),
            rrname: z.string(),
            rrtype: z.string(),
            tx_id: z.number(),
            opcode: z.number(),
            type: z.literal('query'),
          }),
        )
        .optional(),
      answer: z
        .array(
          z.object({
            id: z.number(),
            rrname: z.string(),
            rrtype: z.string(),
            ttl: z.number(),
            rdata: z.string(),
          }),
        )
        .optional(),
    }),
    z.object({
      version: z.literal(3),
      queries: z
        .array(
          z.object({
            id: z.number(),
            rrname: z.string(),
            rrtype: z.string(),
            tx_id: z.number(),
            opcode: z.number(),
            type: z.literal('query'),
          }),
        )
        .optional(),
      answers: z
        .array(
          z.object({
            id: z.number(),
            rrname: z.string(),
            rrtype: z.string(),
            ttl: z.number(),
            rdata: z.string(),
          }),
        )
        .optional(),
    }),
  ]),
  geoip: z.object({
    country_name: z.string(),
    country: z.object({
      iso_code: z.string(),
    }),
    provider: z.object({
      autonomous_system_number: z.number(),
      autonomous_system_organization: z.string(),
    }),
  }),
  http: z
    .object({
      hostname: z.string(),
      url: z.string(),
      status: z.string(),
      http_method: z.string(),
      http_user_agent: z.string(),
      http_refer: z.string(),
      http_port: z.string(),
      http_content_type: z.string(),
      length: z.string(),
      server: z.string(),
      accept_language: z.string(),
      protocol: z.string(),
      http_response_body_printable: z.string().optional(),
      http_request_body_printable: z.string().optional(),
    })
    .optional(),
  tls: z
    .object({
      sni: z.string(),
      version: z.string(),
      cipher_suite: z.string(),
      cipher_security: z.string(),
      ja3: z.object({
        hash: z.string(),
        agent: z.array(z.string()),
      }),
      ja3s: z.object({
        hash: z.string(),
        agent: z.array(z.string()),
      }),
      ja4: z.string(),
      alpn_ts: z.array(z.string()),
      alpn_tc: z.string(),
      subject: z.string(),
      issuerdn: z.string(),
      notbefore: z.string(),
      notafter: z.string(),
      fingerprint: z.string(),
    })
    .optional(),
  smtp: z
    .object({
      mail_from: z.string(),
      rcpt_to: z.array(z.string()),
      helo: z.string(),
    })
    .optional(),
  ssh: z
    .object({
      server: z.object({
        software_version: z.string(),
        proto_version: z.string(),
        hassh: z.object({
          hash: z.string(),
          string: z.string(),
        }),
      }),
      client: z.object({
        software_version: z.string(),
        proto_version: z.string(),
        hassh: z.object({
          hash: z.string(),
          string: z.string(),
        }),
      }),
    })
    .optional(),
  ether: z.object({
    src_mac: z.string(),
    dest_mac: z.string(),
  }),
  smb: smbSchema.optional(),
  snmp: snmpSchema.optional(),
  discovery: z.object({
    asset_role: z.array(z.string()),
    key: z.string(),
    asset: z.string(),
    value: z.string(),
    asset_net: z.string(),
  }),
  payload_printable: z.string().optional(),
  http_response_body_printable: z.string(),
  user_agent: z.object({
    os_name: z.string(),
    os: z.string(),
    name: z.string(),
    device: z.string(),
    os_full: z.string(),
  }),
  hostname: z.string(),
  hostname_info: hostnameInfoSchema.optional(),
  url: z.string(),
  http_user_agent: z.string(),
  http_content_type: z.string(),
  packet: z.string(),
  see_name: z.string(),
  tx_id: z.number(),
  '@version': z.string(),
  _id: z.string(),
  files: z.array(fileInfoSchema).optional(),
  fileinfo: fileInfoSchema.optional(),
  anomaly: anomalySchema.optional(),
  stamus_novel: z.boolean().optional(),
  uuid: z.string(),
  stamus: stamusSchema.optional(),
});

export type Event = z.infer<typeof eventSchema>;
