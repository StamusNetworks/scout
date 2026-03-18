import { Event } from '@/features/events/common/events.model';
import { Pcap } from '@/features/hunt/events/components/pcap/pcap';

import { TabComponentType } from '../event-detail-tabs.types';

export const PcapTab: TabComponentType<{ event: Event }> = () => null;

PcapTab.tabConfig = ({ event }) => {
  if (!event.capture_file) return null;

  return {
    id: 'pcap_file',
    label: 'PCAP File',
    content: <Pcap event={event} />,
  };
};
