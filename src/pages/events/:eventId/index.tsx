import { TabsContent } from '@radix-ui/react-tabs';
import { Binary } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { keys } from 'ramda';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { JsonView } from '@/common/design-system/atoms/json-view';
import {
  Tabs,
  TabsBadge,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Tag } from '@/common/design-system/layouts/components/navigation/navigation';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import {
  useGetEventsFromFlowQuery,
  useGetEventsQuery,
} from '@/features/hunt/events/api/events.api';
import { DetectionMethodTab } from '@/features/hunt/events/components/detection-method/detection-method';
import { Files } from '@/features/hunt/events/components/files/files';
import { MetaView } from '@/features/hunt/events/components/meta-view/meta-view';
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
import { SyntheticView } from '@/features/hunt/events/components/synthetic-view/synthetic-view';

export const EventByIdPage = () => {
  const [_id] = useQueryState('_id', parseAsString);
  const [uuid] = useQueryState('uuid', parseAsString);
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError: isErrorEvents,
  } = useGetEventsQuery(
    {
      ...params,
      start_date: 1,
      qfilter: uuid ? `uuid:"${uuid}"` : `_id:"${_id}"`,
      pageIndex: 0,
      pageSize: 1,
      stamus: true,
      alert: true,
      discovery: true,
    },
    {
      skip: !_id && !uuid,
    },
  );
  const event = eventData?.results?.[0];

  const { data: flowEvents, isLoading: flowEventsLoading } =
    useGetEventsFromFlowQuery(
      {
        ...params,
        qfilter: `flow_id:${event?.flow_id}`,
      },
      {
        skip: event?.flow_id ? false : true,
      },
    );

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
    <>
      <OutletBreadcrumb>{event?.uuid || event?._id}</OutletBreadcrumb>
      <DefaultPage title="Event details">
        {isLoadingEvent ? (
          <div>Loading...</div>
        ) : !_id && !uuid ? (
          <Empty className="min-h-96 border">
            <EmptyMedia variant="icon">
              <Binary />
            </EmptyMedia>
            <EmptyHeader>No event id provided</EmptyHeader>
            <EmptyDescription className="flex flex-col gap-2">
              An event id is required to view an event.
              <Link to="/events">
                <Button>View events</Button>
              </Link>
            </EmptyDescription>
          </Empty>
        ) : isErrorEvents || !event ? (
          <div>Error</div>
        ) : (
          <Tabs defaultValue="meta_view">
            <TabsList className="mb-2 flex-wrap gap-y-1">
              <TabsTrigger value="meta_view">
                Meta view{' '}
                <Tag className="ml-2 bg-lime-200 text-lime-900">Beta</Tag>
              </TabsTrigger>
              <TabsTrigger value="synthetic_view">Synthetic view</TabsTrigger>
              <TabsTrigger value="json_view">JSON View</TabsTrigger>
              <TabsTrigger value="detection_method">
                Detection Method
              </TabsTrigger>
              {flowKeys.sort().map((key) => {
                const count = flowEvents?.[key]?.length || 0;
                return (
                  <TabsTrigger
                    key={key}
                    value={`related-${key}`}
                  >
                    Related {key}
                    {key === 'Alert' && 's'}
                    <TabsBadge
                      count={count}
                      isLoading={flowEventsLoading}
                    />
                  </TabsTrigger>
                );
              })}
              <TabsTrigger value="related_smb">Related SMB</TabsTrigger>
              <TabsTrigger value="pcap_file">PCAP File</TabsTrigger>
              {files.length > 0 && (
                <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="meta_view">
              <MetaView event={event} />
            </TabsContent>
            <TabsContent value="synthetic_view">
              <SyntheticView event={event} />
            </TabsContent>
            {files.length > 0 && (
              <TabsContent value="files">
                <Files files={files} />
              </TabsContent>
            )}
            <TabsContent value="related_smb">related_smb</TabsContent>
            <TabsContent value="json_view">
              <JsonView data={event} />
            </TabsContent>
            <TabsContent value="pcap_file">pcap_file</TabsContent>
            <TabsContent value="detection_method">
              <DetectionMethodTab sid={event?.alert.signature_id} />
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
          </Tabs>
        )}
      </DefaultPage>
    </>
  );
};
