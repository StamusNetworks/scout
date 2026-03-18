import { RelatedAlertsTab } from '@/features/hunt/events/components/related-events/related-alerts/related-alerts';
import { RelatedAnomalyTab } from '@/features/hunt/events/components/related-events/related-anomaly/related-anomaly';
import { RelatedDcerpcTab } from '@/features/hunt/events/components/related-events/related-dcerpc/related-dcerpc';
import { RelatedDhcpTab } from '@/features/hunt/events/components/related-events/related-dhcp/related-dhcp';
import { RelatedDnsTab } from '@/features/hunt/events/components/related-events/related-dns/related-dns';
import { RelatedFileinfoTab } from '@/features/hunt/events/components/related-events/related-file-info/related-file-info';
import { RelatedFlowTab } from '@/features/hunt/events/components/related-events/related-flow/related-flow';
import { RelatedFtpTab } from '@/features/hunt/events/components/related-events/related-ftp/related-ftp';
import { RelatedFtp_DataTab } from '@/features/hunt/events/components/related-events/related-ftp_data/related-ftp_data';
import { RelatedHttpTab } from '@/features/hunt/events/components/related-events/related-http/related-http';
import { RelatedKrb5Tab } from '@/features/hunt/events/components/related-events/related-krb5/related-krb5';
import { RelatedMqttTab } from '@/features/hunt/events/components/related-events/related-mqtt/related-mqtt';
import { RelatedNetflowTab } from '@/features/hunt/events/components/related-events/related-netflow/related-netflow';
import { RelatedNfsTab } from '@/features/hunt/events/components/related-events/related-nfs/related-nfs';
import { RelatedRdpTab } from '@/features/hunt/events/components/related-events/related-rdp/related-rdp';
import { RelatedRfbTab } from '@/features/hunt/events/components/related-events/related-rfb/related-rfb';
import { RelatedSipTab } from '@/features/hunt/events/components/related-events/related-sip/related-sip';
import { RelatedSmbTab } from '@/features/hunt/events/components/related-events/related-smb/related-smb';
import { RelatedSmtpTab } from '@/features/hunt/events/components/related-events/related-smtp/related-smtp';
import { RelatedSnmpTab } from '@/features/hunt/events/components/related-events/related-snmp/related-snmp';
import { RelatedSshTab } from '@/features/hunt/events/components/related-events/related-ssh/related-ssh';
import { RelatedStamusTab } from '@/features/hunt/events/components/related-events/related-stamus/related-stamus';
import { RelatedTftpTab } from '@/features/hunt/events/components/related-events/related-tftp/related-tftp';
import { RelatedTlsTab } from '@/features/hunt/events/components/related-events/related-tls/related-tls';
import { DcerpcEvent } from '@/features/hunt/events/model/app-proto/dcerpc.schema';
import { DhcpEvent } from '@/features/hunt/events/model/app-proto/dhcp.schema';
import { DnsEvent } from '@/features/hunt/events/model/app-proto/dns.schema';
import { FtpEvent } from '@/features/hunt/events/model/app-proto/ftp.schema';
import { FtpDataEvent } from '@/features/hunt/events/model/app-proto/ftp_data.schema';
import { HttpEvent } from '@/features/hunt/events/model/app-proto/http.schema';
import { Krb5Event } from '@/features/hunt/events/model/app-proto/krb5.schema';
import { MqttEvent } from '@/features/hunt/events/model/app-proto/mqtt.schema';
import { NetflowEvent } from '@/features/hunt/events/model/app-proto/netflow.schema';
import { NfsEvent } from '@/features/hunt/events/model/app-proto/nfs.schema';
import { RdpEvent } from '@/features/hunt/events/model/app-proto/rdp.schema';
import { RfbEvent } from '@/features/hunt/events/model/app-proto/rfb.schema';
import { SipEvent } from '@/features/hunt/events/model/app-proto/sip.schema';
import { SmbEvent } from '@/features/hunt/events/model/app-proto/smb.schema';
import { SmtpEvent } from '@/features/hunt/events/model/app-proto/smtp.schema';
import { SnmpEvent } from '@/features/hunt/events/model/app-proto/snmp.schema';
import { SshEvent } from '@/features/hunt/events/model/app-proto/ssh.schema';
import { TftpEvent } from '@/features/hunt/events/model/app-proto/tftp.schema';
import { TlsEvent } from '@/features/hunt/events/model/app-proto/tls.schema';
import { AlertEvent } from '@/features/hunt/events/model/event-types/alert.schema';
import { Anomaly } from '@/features/hunt/events/model/event-types/anomaly.schema';
import { FileinfoEvent } from '@/features/hunt/events/model/event-types/fileinfo.schema';
import { FlowEvent } from '@/features/hunt/events/model/event-types/flow.schema';
import { StamusEvent } from '@/features/hunt/events/model/event-types/stamus.schema';

import { useGetSightingById } from '../hooks/use-get-sighting-by-id';
import { useGetSightingEventsTail } from '../hooks/use-get-sighting-events-tail';

interface EventsStreamProps {
  sightingId: string;
}
export const EventsStream = ({ sightingId }: EventsStreamProps) => {
  const { data: sighting } = useGetSightingById(sightingId);
  const { data } = useGetSightingEventsTail({
    key: sighting?.discovery?.key,
    value: sighting?.discovery?.value,
    protocol: sighting?.app_proto,
  });

  switch (data?.results?.[0]?.event_type) {
    case 'alert':
      return (
        <RelatedAlertsTab data={data?.results as unknown as AlertEvent[]} />
      );
    case 'anomaly':
      return <RelatedAnomalyTab data={data?.results as unknown as Anomaly[]} />;
    case 'dcerpc':
      return (
        <RelatedDcerpcTab data={data?.results as unknown as DcerpcEvent[]} />
      );
    case 'dhcp':
      return <RelatedDhcpTab data={data?.results as unknown as DhcpEvent[]} />;
    case 'dns':
      return <RelatedDnsTab data={data?.results as unknown as DnsEvent[]} />;
    case 'fileinfo':
      return (
        <RelatedFileinfoTab
          data={data?.results as unknown as FileinfoEvent[]}
        />
      );
    case 'flow':
      return <RelatedFlowTab data={data?.results as unknown as FlowEvent[]} />;
    case 'ftp':
      return <RelatedFtpTab data={data?.results as unknown as FtpEvent[]} />;
    case 'ftp_data':
      return (
        <RelatedFtp_DataTab data={data?.results as unknown as FtpDataEvent[]} />
      );
    case 'http':
      return <RelatedHttpTab data={data?.results as unknown as HttpEvent[]} />;
    case 'krb5':
      return <RelatedKrb5Tab data={data?.results as unknown as Krb5Event[]} />;
    case 'mqtt':
      return <RelatedMqttTab data={data?.results as unknown as MqttEvent[]} />;
    case 'netflow':
      return (
        <RelatedNetflowTab data={data?.results as unknown as NetflowEvent[]} />
      );
    case 'nfs':
      return <RelatedNfsTab data={data?.results as unknown as NfsEvent[]} />;
    case 'rdp':
      return <RelatedRdpTab data={data?.results as unknown as RdpEvent[]} />;
    case 'rfb':
      return <RelatedRfbTab data={data?.results as unknown as RfbEvent[]} />;
    case 'sip':
      return <RelatedSipTab data={data?.results as unknown as SipEvent[]} />;
    case 'smb':
      return <RelatedSmbTab data={data?.results as unknown as SmbEvent[]} />;
    case 'smtp':
      return <RelatedSmtpTab data={data?.results as unknown as SmtpEvent[]} />;
    case 'snmp':
      return <RelatedSnmpTab data={data?.results as unknown as SnmpEvent[]} />;
    case 'ssh':
      return <RelatedSshTab data={data?.results as unknown as SshEvent[]} />;
    case 'stamus':
      return (
        <RelatedStamusTab data={data?.results as unknown as StamusEvent[]} />
      );
    case 'tftp':
      return <RelatedTftpTab data={data?.results as unknown as TftpEvent[]} />;
    case 'tls':
      return <RelatedTlsTab data={data?.results as unknown as TlsEvent[]} />;
    default:
      return null;
  }
};
