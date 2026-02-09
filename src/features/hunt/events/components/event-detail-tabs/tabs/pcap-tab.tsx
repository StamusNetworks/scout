import { Event } from '../../../model/event.schema';
import { Pcap } from '../../pcap/pcap';
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
