import { SyntheticView } from '@/features/events/common/molecules/synthetic-view/synthetic-view';
import { Event } from '@/features/events/model/event';

import { TabComponentType } from '../event-detail-tabs.types';

export const SyntheticTab: TabComponentType<{ event: Event }> = () => null;

SyntheticTab.tabConfig = ({ event }) => ({
  id: 'synthetic_view',
  label: 'Synthetic view',
  content: <SyntheticView event={event} />,
});
