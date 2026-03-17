import { SyntheticView } from '@/features/hunt/events/components/synthetic-view/synthetic-view';
import { Event } from '@/features/hunt/events/model/event.schema';

import { TabComponentType } from '../event-detail-tabs.types';

export const SyntheticTab: TabComponentType<{ event: Event }> = () => null;

SyntheticTab.tabConfig = ({ event }) => ({
  id: 'synthetic_view',
  label: 'Synthetic view',
  content: <SyntheticView event={event} />,
});
