import { keys } from 'ramda';
import { ComponentType } from 'react';

import { TabsBadge } from '@/common/design-system/atoms/ui/borderTabs';
import { FlowEvents } from '@/features/events/common/model/flowEvent.schema';
import { RelatedAlertsTab } from '@/features/events/common/molecules/related-events/related-alerts/related-alerts';
import { RelatedAnomalyTab } from '@/features/events/common/molecules/related-events/related-anomaly/related-anomaly';
import { RelatedDcerpcTab } from '@/features/events/common/molecules/related-events/related-dcerpc/related-dcerpc';
import { RelatedDhcpTab } from '@/features/events/common/molecules/related-events/related-dhcp/related-dhcp';
import { RelatedDnsTab } from '@/features/events/common/molecules/related-events/related-dns/related-dns';
import { RelatedFileinfoTab } from '@/features/events/common/molecules/related-events/related-file-info/related-file-info';
import { RelatedFlowTab } from '@/features/events/common/molecules/related-events/related-flow/related-flow';
import { RelatedFtpTab } from '@/features/events/common/molecules/related-events/related-ftp/related-ftp';
import { RelatedFtp_DataTab } from '@/features/events/common/molecules/related-events/related-ftp_data/related-ftp_data';
import { RelatedHttpTab } from '@/features/events/common/molecules/related-events/related-http/related-http';
import { RelatedKrb5Tab } from '@/features/events/common/molecules/related-events/related-krb5/related-krb5';
import { RelatedMqttTab } from '@/features/events/common/molecules/related-events/related-mqtt/related-mqtt';
import { RelatedNetflowTab } from '@/features/events/common/molecules/related-events/related-netflow/related-netflow';
import { RelatedNfsTab } from '@/features/events/common/molecules/related-events/related-nfs/related-nfs';
import { RelatedRdpTab } from '@/features/events/common/molecules/related-events/related-rdp/related-rdp';
import { RelatedRfbTab } from '@/features/events/common/molecules/related-events/related-rfb/related-rfb';
import { RelatedSipTab } from '@/features/events/common/molecules/related-events/related-sip/related-sip';
import { RelatedSmbTab } from '@/features/events/common/molecules/related-events/related-smb/related-smb';
import { RelatedSmbInsightsTab } from '@/features/events/common/molecules/related-events/related-smb_insights/related-smb_insights';
import { RelatedSmtpTab } from '@/features/events/common/molecules/related-events/related-smtp/related-smtp';
import { RelatedSnmpTab } from '@/features/events/common/molecules/related-events/related-snmp/related-snmp';
import { RelatedSshTab } from '@/features/events/common/molecules/related-events/related-ssh/related-ssh';
import { RelatedStamusTab } from '@/features/events/common/molecules/related-events/related-stamus/related-stamus';
import { RelatedTftpTab } from '@/features/events/common/molecules/related-events/related-tftp/related-tftp';
import { RelatedTlsTab } from '@/features/events/common/molecules/related-events/related-tls/related-tls';

import { TabComponentType, TabConfig } from '../event-detail-tabs.types';

const PROTOCOL_REGISTRY: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { component: ComponentType<{ data?: any[] }>; pluralize?: boolean }
> = {
  Alert: { component: RelatedAlertsTab, pluralize: true },
  Anomaly: { component: RelatedAnomalyTab },
  Dcerpc: { component: RelatedDcerpcTab },
  Dhcp: { component: RelatedDhcpTab },
  Dns: { component: RelatedDnsTab },
  Fileinfo: { component: RelatedFileinfoTab },
  Flow: { component: RelatedFlowTab },
  Ftp: { component: RelatedFtpTab },
  Ftp_Data: { component: RelatedFtp_DataTab },
  Http: { component: RelatedHttpTab },
  Krb5: { component: RelatedKrb5Tab },
  Mqtt: { component: RelatedMqttTab },
  Netflow: { component: RelatedNetflowTab },
  Nfs: { component: RelatedNfsTab },
  Rdp: { component: RelatedRdpTab },
  Rfb: { component: RelatedRfbTab },
  Sip: { component: RelatedSipTab },
  Smb: { component: RelatedSmbTab },
  Smb_Insights: { component: RelatedSmbInsightsTab },
  Smtp: { component: RelatedSmtpTab },
  Snmp: { component: RelatedSnmpTab },
  Ssh: { component: RelatedSshTab },
  Stamus: { component: RelatedStamusTab },
  Tftp: { component: RelatedTftpTab },
  Tls: { component: RelatedTlsTab },
};

export const RelatedEventsTabs: TabComponentType = () => null;

RelatedEventsTabs.tabConfig = (_props, { flowEvents, flowEventsLoading }) => {
  const flowKeys = keys(flowEvents || {}) as (keyof FlowEvents)[];

  return flowKeys.sort().reduce<TabConfig[]>((tabs, key) => {
    const config = PROTOCOL_REGISTRY[key];
    if (!config) return tabs;

    const count = flowEvents?.[key]?.length || 0;
    const Component = config.component;

    tabs.push({
      id: `related-${key}`,
      label: (
        <>
          Related {key}
          {config.pluralize && 's'}
          <TabsBadge
            count={count}
            isLoading={flowEventsLoading}
          />
        </>
      ),
      content: <Component data={flowEvents?.[key]} />,
    });

    return tabs;
  }, []);
};
