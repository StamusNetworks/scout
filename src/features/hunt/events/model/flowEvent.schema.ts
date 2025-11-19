import { z } from 'zod';

import { etherSchema } from './enrichments/ether.schema';
import { FQDNSchema } from './enrichments/FQDN.schema';
import { geoipSchema } from './enrichments/geoip.schema';
import { hostnameInfoSchema } from './enrichments/hostnameInfo.schema';
import { netInfoSchema } from './enrichments/netInfo.schema';
import { trafficSchema } from './enrichments/traffic.schema';
import { flowAlertSchema } from './event-types/alert.schema';
import { anomalyEventSchema } from './event-types/anomaly.schema';
import { dcerpcEventSchema } from './event-types/dcerpc.schema';
import { dhcpEventSchema } from './event-types/dhcp.schema';
import { dnsEventSchema } from './event-types/dns.schema';
import { fileinfoEventSchema } from './event-types/fileinfo.schema';
import { flowEventSchema } from './event-types/flow.schema';
import { ftpEventSchema } from './event-types/ftp.schema';
import { ftpDataEventSchema } from './event-types/ftp_data.schema';
import { httpEventSchema } from './event-types/http.schema';
import { krb5EventSchema } from './event-types/krb5.schema';
import { mqttEventSchema } from './event-types/mqtt.schema';
import { netflowEventSchema } from './event-types/netflow.schema';
import { nfsEventSchema } from './event-types/nfs.schema';
import { rdpEventSchema } from './event-types/rdp.schema';
import { rfbEventSchema } from './event-types/rfb.schema';
import { sipEventSchema } from './event-types/sip.schema';
import { smbEventSchema } from './event-types/smb.schema';
import { smbInsightsEventSchema } from './event-types/smb_insights.schema';
import { smtpEventSchema } from './event-types/smtp.schema';
import { snmpEventSchema } from './event-types/snmp.schema';
import { sshEventSchema } from './event-types/ssh.schema';
import { stamusEventSchema } from './event-types/stamus.schema';
import { tftpEventSchema } from './event-types/tftp.schema';
import { tlsEventSchema } from './event-types/tls.schema';

export const logEventSchema = z.object({
  file: z.object({
    path: z.string(),
  }),
  offset: z.number(),
});
export const eventAgentSchema = z.object({
  type: z.string(),
  name: z.string(),
  version: z.string(),
  id: z.string(),
  ephemeral_id: z.string(),
  hostname: z.string(),
});

export const eventInputSchema = z.object({
  type: z.string(),
});

export const baseFlowEventSchema = z.object({
  '@timestamp': z.string(),
  '@version': z.string(),
  logger: z.string().optional(),
  tenant: z.number().optional(),
  timestamp: z.string(),
  flow_id: z.number(),
  tx_id: z.number().optional(),
  alerted: z.boolean().optional(),
  pcap_cnt: z.number().optional(),
  community_id: z.string().optional(),
  vlan: z.array(z.number()).optional(),
  in_iface: z.string().optional(),
  event_type: z.string(),
  pkt_src: z.string().optional(),
  parent_id: z.number().optional(),
  ether: etherSchema.optional(),
  net_info: netInfoSchema.optional(),
  traffic: trafficSchema.optional(),
  geoip: geoipSchema.optional(),
  hostname_info: hostnameInfoSchema.optional(),
  fqdn: FQDNSchema.optional(),
  agent: eventAgentSchema.optional(),
  log: logEventSchema.optional(),
  input: eventInputSchema.optional(),
  host: z.string().optional(),
  proto: z.string(),
  src_ip: z.string().optional(),
  src_port: z.number().optional(),
  dest_ip: z.string().optional(),
  dest_port: z.number().optional(),
  app_proto: z.string().optional(),
  app_proto_orig: z.string().optional(),
  app_proto_expected: z.string().optional(),
  app_proto_tc: z.string().optional(),
  app_proto_ts: z.string().optional(),
  icmp_code: z.number().optional(),
  icmp_type: z.number().optional(),
  response_icmp_code: z.number().optional(),
  response_icmp_type: z.number().optional(),
  stamus_infrequent: z.boolean().optional(),
});

export const flowEventsSchema = z.object({
  Alert: z.array(flowAlertSchema).optional(),
  Anomaly: z.array(anomalyEventSchema).optional(),
  Dcerpc: z.array(dcerpcEventSchema).optional(),
  Dhcp: z.array(dhcpEventSchema).optional(),
  Dns: z.array(dnsEventSchema).optional(),
  Fileinfo: z.array(fileinfoEventSchema).optional(),
  Flow: z.array(flowEventSchema).optional(),
  Ftp_Data: z.array(ftpDataEventSchema).optional(),
  Ftp: z.array(ftpEventSchema).optional(),
  Http: z.array(httpEventSchema).optional(),
  Krb5: z.array(krb5EventSchema).optional(),
  Mqtt: z.array(mqttEventSchema).optional(),
  Netflow: z.array(netflowEventSchema).optional(),
  Nfs: z.array(nfsEventSchema).optional(),
  Rdp: z.array(rdpEventSchema).optional(),
  Rfb: z.array(rfbEventSchema).optional(),
  Sip: z.array(sipEventSchema).optional(),
  Smb: z.array(smbEventSchema).optional(),
  Smb_Insights: z.array(smbInsightsEventSchema).optional(),
  Smtp: z.array(smtpEventSchema).optional(),
  Snmp: z.array(snmpEventSchema).optional(),
  Ssh: z.array(sshEventSchema).optional(),
  Stamus: z.array(stamusEventSchema).optional(),
  Tftp: z.array(tftpEventSchema).optional(),
  Tls: z.array(tlsEventSchema).optional(),
});

export type FlowEvents = z.infer<typeof flowEventsSchema>;

/* File Status */
export const flowEventFileStatus = z.object({
  status: z.string(),
});

export type FlowEventFileStatus = z.infer<typeof flowEventFileStatus>;

/* File Retrieve */
export const flowEventFileRetrieve = z.object({
  retrieve: z.string(),
});

export type FlowEventFileRetrieve = z.infer<typeof flowEventFileRetrieve>;
