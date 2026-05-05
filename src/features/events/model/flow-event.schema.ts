import { z } from 'zod';

import { DcerpcEvent, dcerpcEventSchema } from './app-proto/dcerpc.schema';
import { DhcpEvent, dhcpEventSchema } from './app-proto/dhcp.schema';
import { DnsEvent, dnsEventSchema } from './app-proto/dns.schema';
import { FtpDataEvent, ftpDataEventSchema } from './app-proto/ftp-data.schema';
import { FtpEvent, ftpEventSchema } from './app-proto/ftp.schema';
import { HttpEvent, httpEventSchema } from './app-proto/http.schema';
import { Krb5Event, krb5EventSchema } from './app-proto/krb5.schema';
import { MqttEvent, mqttEventSchema } from './app-proto/mqtt.schema';
import { NetflowEvent, netflowEventSchema } from './app-proto/netflow.schema';
import { NfsEvent, nfsEventSchema } from './app-proto/nfs.schema';
import { RdpEvent, rdpEventSchema } from './app-proto/rdp.schema';
import { RfbEvent, rfbEventSchema } from './app-proto/rfb.schema';
import { SipEvent, sipEventSchema } from './app-proto/sip.schema';
import { SmbEvent, smbEventSchema } from './app-proto/smb.schema';
import { SmtpEvent, smtpEventSchema } from './app-proto/smtp.schema';
import { SnmpEvent, snmpEventSchema } from './app-proto/snmp.schema';
import { SshEvent, sshEventSchema } from './app-proto/ssh.schema';
import { TftpEvent, tftpEventSchema } from './app-proto/tftp.schema';
import { TlsEvent, tlsEventSchema } from './app-proto/tls.schema';
import { AlertEvent, alertEventSchema } from './event-types/alert.schema';
import { Anomaly, anomalyEventSchema } from './event-types/anomaly.schema';
import {
  FileinfoEvent,
  fileinfoEventSchema,
} from './event-types/fileinfo.schema';
import { FlowEvent, flowEventSchema } from './event-types/flow.schema';
import {
  SmbInsightsEvent,
  smbInsightsEventSchema,
} from './event-types/smb-insights.schema';
import { StamusEvent, stamusEventSchema } from './event-types/stamus.schema';

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

export type RelatedEvent =
  | AlertEvent
  | Anomaly
  | DcerpcEvent
  | DhcpEvent
  | DnsEvent
  | FileinfoEvent
  | FlowEvent
  | FtpEvent
  | FtpDataEvent
  | HttpEvent
  | Krb5Event
  | MqttEvent
  | NetflowEvent
  | NfsEvent
  | RdpEvent
  | RfbEvent
  | SipEvent
  | SmbEvent
  | SmbInsightsEvent
  | SmtpEvent
  | SnmpEvent
  | SshEvent
  | StamusEvent
  | TftpEvent
  | TlsEvent;
