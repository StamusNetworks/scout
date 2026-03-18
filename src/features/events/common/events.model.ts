import { z } from 'zod';

import { dcerpcSchema } from '@/features/events/common/model/app-proto/dcerpc.schema';
import { dhcpSchema } from '@/features/events/common/model/app-proto/dhcp.schema';
import { dnsSchema } from '@/features/events/common/model/app-proto/dns.schema';
import { ftpSchema } from '@/features/events/common/model/app-proto/ftp.schema';
import { ftpDataSchema } from '@/features/events/common/model/app-proto/ftp_data.schema';
import { httpSchema } from '@/features/events/common/model/app-proto/http.schema';
import { ikeSchema } from '@/features/events/common/model/app-proto/ike.schema';
import { ikev2Schema } from '@/features/events/common/model/app-proto/ikev2.schema';
import { krb5Schema } from '@/features/events/common/model/app-proto/krb5.schema';
import { mqttSchema } from '@/features/events/common/model/app-proto/mqtt.schema';
import { netflowSchema } from '@/features/events/common/model/app-proto/netflow.schema';
import { nfsSchema } from '@/features/events/common/model/app-proto/nfs.schema';
import { nfsRcpSchema } from '@/features/events/common/model/app-proto/nfs_rcp.schema';
import { quicSchema } from '@/features/events/common/model/app-proto/quic.schema';
import { rdpSchema } from '@/features/events/common/model/app-proto/rdp.schema';
import { rfbSchema } from '@/features/events/common/model/app-proto/rfb.schema';
import { sipSchema } from '@/features/events/common/model/app-proto/sip.schema';
import { smbSchema } from '@/features/events/common/model/app-proto/smb.schema';
import { smtpSchema } from '@/features/events/common/model/app-proto/smtp.schema';
import { snmpSchema } from '@/features/events/common/model/app-proto/snmp.schema';
import { sshSchema } from '@/features/events/common/model/app-proto/ssh.schema';
import { tftpSchema } from '@/features/events/common/model/app-proto/tftp.schema';
import { tlsSchema } from '@/features/events/common/model/app-proto/tls.schema';
import { etherSchema } from '@/features/events/common/model/enrichments/ether.schema';
import { filesSchema } from '@/features/events/common/model/enrichments/files.schema';
import { FQDNSchema } from '@/features/events/common/model/enrichments/FQDN.schema';
import { geoipSchema } from '@/features/events/common/model/enrichments/geoip.schema';
import { hostnameInfoSchema } from '@/features/events/common/model/enrichments/hostnameInfo.schema';
import { netInfoSchema } from '@/features/events/common/model/enrichments/netInfo.schema';
import { trafficSchema } from '@/features/events/common/model/enrichments/traffic.schema';
import { alertSchema } from '@/features/events/common/model/event-types/alert.schema';
import { anomalySchema } from '@/features/events/common/model/event-types/anomaly.schema';
import { discoverySchema } from '@/features/events/common/model/event-types/discovery.schema';
import { fileInfoSchema } from '@/features/events/common/model/event-types/fileinfo.schema';
import { flowSchema } from '@/features/events/common/model/event-types/flow.schema';
import { smbInsightsEventSchema } from '@/features/events/common/model/event-types/smb_insights.schema';
import { stamusSchema } from '@/features/events/common/model/event-types/stamus.schema';
import {
  eventAgentSchema,
  eventInputSchema,
  logEventSchema,
} from '@/features/events/common/model/flowEvent.schema';

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
