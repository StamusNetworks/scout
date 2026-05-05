import { z } from 'zod';

import { dcerpcSchema } from './app-proto/dcerpc.schema';
import { dhcpSchema } from './app-proto/dhcp.schema';
import { dnsSchema } from './app-proto/dns.schema';
import { ftpDataSchema } from './app-proto/ftp-data.schema';
import { ftpSchema } from './app-proto/ftp.schema';
import { httpSchema } from './app-proto/http.schema';
import { ikeSchema } from './app-proto/ike.schema';
import { ikev2Schema } from './app-proto/ikev2.schema';
import { krb5Schema } from './app-proto/krb5.schema';
import { mqttSchema } from './app-proto/mqtt.schema';
import { netflowSchema } from './app-proto/netflow.schema';
import { nfsRcpSchema } from './app-proto/nfs-rcp.schema';
import { nfsSchema } from './app-proto/nfs.schema';
import { quicSchema } from './app-proto/quic.schema';
import { rdpSchema } from './app-proto/rdp.schema';
import { rfbSchema } from './app-proto/rfb.schema';
import { sipSchema } from './app-proto/sip.schema';
import { smbSchema } from './app-proto/smb.schema';
import { smtpSchema } from './app-proto/smtp.schema';
import { snmpSchema } from './app-proto/snmp.schema';
import { sshSchema } from './app-proto/ssh.schema';
import { tftpSchema } from './app-proto/tftp.schema';
import { tlsSchema } from './app-proto/tls.schema';
import { etherSchema } from './enrichments/ether.schema';
import { filesSchema } from './enrichments/files.schema';
import { FQDNSchema } from './enrichments/fqdn.schema';
import { geoipSchema } from './enrichments/geoip.schema';
import { hostnameInfoSchema } from './enrichments/hostname-info.schema';
import { netInfoSchema } from './enrichments/net-info.schema';
import { trafficSchema } from './enrichments/traffic.schema';
import { alertSchema } from './event-types/alert.schema';
import { anomalySchema } from './event-types/anomaly.schema';
import { discoverySchema } from './event-types/discovery.schema';
import { fileInfoSchema } from './event-types/fileinfo.schema';
import { flowSchema } from './event-types/flow.schema';
import { smbInsightsEventSchema } from './event-types/smb-insights.schema';
import { stamusSchema } from './event-types/stamus.schema';
import {
  eventAgentSchema,
  eventInputSchema,
  logEventSchema,
} from './flow-event.schema';

export const baseEventSchema = z.object({
  _id: z.string(),
  '@timestamp': z.string(),
  agent: eventAgentSchema.optional(),
  app_proto: z.string(),
  app_proto_orig: z.string().optional(),
  capture_file: z.string().optional(),
  community_id: z.string().optional(),
  dest_ip: z.string(),
  dest_port: z.number(),
  direction: z.enum(['to_server', 'to_client']).optional(),
  ether: etherSchema.optional(),
  event_type: z.string(),
  flow: flowSchema.optional(),
  flow_id: z.number().optional(),
  fqdn: FQDNSchema.optional(),
  geoip: geoipSchema.optional(),
  host: z.string().optional(),
  hostname_info: hostnameInfoSchema.optional(),
  in_iface: z.string().optional(),
  input: eventInputSchema.optional(),
  log: logEventSchema.optional(),
  net_info: netInfoSchema.optional(),
  payload: z.string().optional(),
  payload_printable: z.string().optional(),
  proto: z.string().optional(),
  src_ip: z.string(),
  src_port: z.number(),
  stamus_novel: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  timestamp: z.string(),
  traffic: trafficSchema.optional(),
  tunnel: z
    .object({
      src_ip: z.string(),
      dest_ip: z.string(),
      proto: z.string(),
      depth: z.number(),
    })
    .optional(),
  tx_id: z.number().optional(),
  uuid: z.string().optional(),
  vlan: z.array(z.number()).optional(),
});

export const eventSchema = baseEventSchema.extend({
  // event-types
  alert: alertSchema.optional(),
  anomaly: anomalySchema.optional(),
  discovery: discoverySchema.optional(),
  fileinfo: fileInfoSchema.optional(),
  flow: flowSchema.optional(),
  smb_insights: smbInsightsEventSchema.optional(),
  stamus: stamusSchema.optional(),
  // app-proto
  dcerpc: dcerpcSchema.optional(),
  dhcp: dhcpSchema.optional(),
  dns: dnsSchema.optional(),
  ftp: ftpSchema.optional(),
  ftp_data: ftpDataSchema.optional(),
  http: httpSchema.optional(),
  ike: ikeSchema.optional(),
  ikev2: ikev2Schema.optional(),
  krb5: krb5Schema.optional(),
  mqtt: mqttSchema.optional(),
  netflow: netflowSchema.optional(),
  nfs_rcp: nfsRcpSchema.optional(),
  nfs: nfsSchema.optional(),
  quic: quicSchema.optional(),
  rdp: rdpSchema.optional(),
  rfb: rfbSchema.optional(),
  sip: sipSchema.optional(),
  smb: smbSchema.optional(),
  smtp: smtpSchema.optional(),
  snmp: snmpSchema.optional(),
  ssh: sshSchema.optional(),
  tftp: tftpSchema.optional(),
  tls: tlsSchema.optional(),
  // enrichments
  files: filesSchema.optional(),
});

export type Event = z.infer<typeof eventSchema>;
