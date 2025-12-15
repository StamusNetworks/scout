import { Row } from '@tanstack/react-table';
import { keys } from 'ramda';
import { useMemo } from 'react';

import { JsonView } from '@/common/design-system/atoms/json-view';
import {
  Tabs,
  TabsBadge,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetEventsFromFlowQuery } from '../../api/events.api';
import { Event } from '../../model/event.schema';
import { DetectionMethodTab } from '../detection-method/detection-method';
import { Files } from '../files/files';
import { Pcap } from '../pcap/pcap';
import { RelatedAlertsTab } from '../related-events/related-alerts/related-alerts';
import { RelatedAnomalyTab } from '../related-events/related-anomaly/related-anomaly';
import { RelatedDcerpcTab } from '../related-events/related-dcerpc/related-dcerpc';
import { RelatedDhcpTab } from '../related-events/related-dhcp/related-dhcp';
import { RelatedDnsTab } from '../related-events/related-dns/related-dns';
import { RelatedFileinfoTab } from '../related-events/related-file-info/related-file-info';
import { RelatedFlowTab } from '../related-events/related-flow/related-flow';
import { RelatedFtpTab } from '../related-events/related-ftp/related-ftp';
import { RelatedFtp_DataTab } from '../related-events/related-ftp_data/related-ftp_data';
import { RelatedHttpTab } from '../related-events/related-http/related-http';
import { RelatedKrb5Tab } from '../related-events/related-krb5/related-krb5';
import { RelatedMqttTab } from '../related-events/related-mqtt/related-mqtt';
import { RelatedNetflowTab } from '../related-events/related-netflow/related-netflow';
import { RelatedNfsTab } from '../related-events/related-nfs/related-nfs';
import { RelatedRdpTab } from '../related-events/related-rdp/related-rdp';
import { RelatedRfbTab } from '../related-events/related-rfb/related-rfb';
import { RelatedSipTab } from '../related-events/related-sip/related-sip';
import { RelatedSmbTab } from '../related-events/related-smb/related-smb';
import { RelatedSmbInsightsTab } from '../related-events/related-smb_insights/related-smb_insights';
import { RelatedSmtpTab } from '../related-events/related-smtp/related-smtp';
import { RelatedSnmpTab } from '../related-events/related-snmp/related-snmp';
import { RelatedSshTab } from '../related-events/related-ssh/related-ssh';
import { RelatedStamusTab } from '../related-events/related-stamus/related-stamus';
import { RelatedTftpTab } from '../related-events/related-tftp/related-tftp';
import { RelatedTlsTab } from '../related-events/related-tls/related-tls';
import { SyntheticView } from '../synthetic-view/synthetic-view';

export const ExpandedEventRow = ({ row }: { row: Row<Event> }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: flowEvents, isLoading: flowEventsLoading } =
    useGetEventsFromFlowQuery({
      ...params,
      qfilter: `flow_id:${row.original.flow_id}`,
    });

  const files = useMemo(() => {
    if (
      !flowEventsLoading &&
      flowEvents?.Fileinfo &&
      flowEvents?.Fileinfo?.length > 0
    ) {
      return flowEvents.Fileinfo.filter((f) => f.fileinfo.stored === true).map(
        (f) => ({
          ...f.fileinfo,
          host: f.host || '',
        }),
      );
    }
    return [];
  }, [flowEvents, flowEventsLoading]);

  const flowKeys = keys(flowEvents || {});

  return (
    <Tabs
      defaultValue="synthetic_view"
      className="p-2"
    >
      <TabsList>
        {/* Synthetic view */}
        <TabsTrigger value="synthetic_view">Synthetic view</TabsTrigger>
        <TabsTrigger value="json_view">JSON View</TabsTrigger>
        <TabsTrigger value="detection_method">Detection Method</TabsTrigger>
        {flowKeys.sort().map((key) => (
          <TabsTrigger
            key={key}
            value={`related-${key}`}
          >
            Related {key}
            {key === 'Alert' && 's'}
            <TabsBadge
              count={flowEvents?.[key]?.length || 0}
              isLoading={flowEventsLoading}
            />
          </TabsTrigger>
        ))}
        <TabsTrigger value="pcap_file">PCAP File</TabsTrigger>
        {files.length > 0 && (
          <TabsTrigger value="files">
            Files{' '}
            <TabsBadge
              count={files.length}
              isLoading={false}
            />
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="synthetic_view">
        <SyntheticView event={row.original} />
      </TabsContent>
      {files.length > 0 && (
        <TabsContent value="files">
          <Files files={files} />
        </TabsContent>
      )}
      <TabsContent value="json_view">
        <JsonView data={row.original} />
      </TabsContent>
      <TabsContent value="pcap_file">
        {row.original.capture_file ? <Pcap event={row.original} /> : null}
      </TabsContent>
      <TabsContent value="detection_method">
        <DetectionMethodTab sid={row.original.alert.signature_id} />
      </TabsContent>
      <TabsContent value="related-Alert">
        <RelatedAlertsTab data={flowEvents?.Alert} />
      </TabsContent>
      <TabsContent value="related-Anomaly">
        <RelatedAnomalyTab data={flowEvents?.Anomaly} />
      </TabsContent>
      <TabsContent value="related-Dcerpc">
        <RelatedDcerpcTab data={flowEvents?.Dcerpc} />
      </TabsContent>
      <TabsContent value="related-Dhcp">
        <RelatedDhcpTab data={flowEvents?.Dhcp} />
      </TabsContent>
      <TabsContent value="related-Dns">
        <RelatedDnsTab data={flowEvents?.Dns} />
      </TabsContent>
      <TabsContent value="related-Fileinfo">
        <RelatedFileinfoTab data={flowEvents?.Fileinfo} />
      </TabsContent>
      <TabsContent value="related-Flow">
        <RelatedFlowTab data={flowEvents?.Flow} />
      </TabsContent>
      <TabsContent value="related-Ftp">
        <RelatedFtpTab data={flowEvents?.Ftp} />
      </TabsContent>
      <TabsContent value="related-Ftp_Data">
        <RelatedFtp_DataTab data={flowEvents?.Ftp_Data} />
      </TabsContent>
      <TabsContent value="related-Http">
        <RelatedHttpTab data={flowEvents?.Http} />
      </TabsContent>
      <TabsContent value="related-Krb5">
        <RelatedKrb5Tab data={flowEvents?.Krb5} />
      </TabsContent>
      <TabsContent value="related-Mqtt">
        <RelatedMqttTab data={flowEvents?.Mqtt} />
      </TabsContent>
      <TabsContent value="related-Netflow">
        <RelatedNetflowTab data={flowEvents?.Netflow} />
      </TabsContent>
      <TabsContent value="related-Nfs">
        <RelatedNfsTab data={flowEvents?.Nfs} />
      </TabsContent>
      <TabsContent value="related-Rdp">
        <RelatedRdpTab data={flowEvents?.Rdp} />
      </TabsContent>
      <TabsContent value="related-Rfb">
        <RelatedRfbTab data={flowEvents?.Rfb} />
      </TabsContent>
      <TabsContent value="related-Sip">
        <RelatedSipTab data={flowEvents?.Sip} />
      </TabsContent>
      <TabsContent value="related-Smb">
        <RelatedSmbTab data={flowEvents?.Smb} />
      </TabsContent>
      <TabsContent value="related-Smtp">
        <RelatedSmtpTab data={flowEvents?.Smtp} />
      </TabsContent>
      <TabsContent value="related-Snmp">
        <RelatedSnmpTab data={flowEvents?.Snmp} />
      </TabsContent>
      <TabsContent value="related-Ssh">
        <RelatedSshTab data={flowEvents?.Ssh} />
      </TabsContent>
      <TabsContent value="related-Stamus">
        <RelatedStamusTab data={flowEvents?.Stamus} />
      </TabsContent>
      <TabsContent value="related-Tftp">
        <RelatedTftpTab data={flowEvents?.Tftp} />
      </TabsContent>
      <TabsContent value="related-Tls">
        <RelatedTlsTab data={flowEvents?.Tls} />
      </TabsContent>
      <TabsContent value="related-Smb_Insights">
        <RelatedSmbInsightsTab data={flowEvents?.Smb_Insights} />
      </TabsContent>
    </Tabs>
  );
};
