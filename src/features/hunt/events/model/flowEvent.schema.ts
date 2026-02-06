import { z } from 'zod';

import { dcerpcEventSchema } from './app-proto/dcerpc.schema';
import { dhcpEventSchema } from './app-proto/dhcp.schema';
import { dnsEventSchema } from './app-proto/dns.schema';
import { ftpEventSchema } from './app-proto/ftp.schema';
import { ftpDataEventSchema } from './app-proto/ftp_data.schema';
import { httpEventSchema } from './app-proto/http.schema';
import { krb5EventSchema } from './app-proto/krb5.schema';
import { mqttEventSchema } from './app-proto/mqtt.schema';
import { netflowEventSchema } from './app-proto/netflow.schema';
import { nfsEventSchema } from './app-proto/nfs.schema';
import { rdpEventSchema } from './app-proto/rdp.schema';
import { rfbEventSchema } from './app-proto/rfb.schema';
import { sipEventSchema } from './app-proto/sip.schema';
import { smbEventSchema } from './app-proto/smb.schema';
import { smtpEventSchema } from './app-proto/smtp.schema';
import { snmpEventSchema } from './app-proto/snmp.schema';
import { sshEventSchema } from './app-proto/ssh.schema';
import { tftpEventSchema } from './app-proto/tftp.schema';
import { tlsEventSchema } from './app-proto/tls.schema';
import { alertEventSchema } from './event-types/alert.schema';
import { anomalyEventSchema } from './event-types/anomaly.schema';
import { fileinfoEventSchema } from './event-types/fileinfo.schema';
import { flowEventSchema } from './event-types/flow.schema';
import { smbInsightsEventSchema } from './event-types/smb_insights.schema';
import { stamusEventSchema } from './event-types/stamus.schema';

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

export const flowEventsSchema = z.object({
  Alert: z.array(alertEventSchema).optional(),
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
