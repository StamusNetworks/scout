import { DetectionMethodTab as DetectionMethodTabContent } from '@/features/events/common/molecules/detection-method/detection-method';
import { Event } from '@/features/events/model/event';

import { TabComponentType } from '../event-detail-tabs.types';

export const DetectionMethodTab: TabComponentType<{ event: Event }> = () =>
  null;

DetectionMethodTab.tabConfig = ({ event }) => {
  if (!event.alert?.signature_id) return null;

  return {
    id: 'detection_method',
    label: 'Detection Method',
    content: <DetectionMethodTabContent sid={event.alert.signature_id} />,
  };
};
