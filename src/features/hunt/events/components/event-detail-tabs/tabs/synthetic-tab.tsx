import { Event } from '../../../model/event.schema';
import { SyntheticView } from '../../synthetic-view/synthetic-view';
import { TabComponentType } from '../event-detail-tabs.types';

export const SyntheticTab: TabComponentType<{ event: Event }> = () => null;

SyntheticTab.tabConfig = ({ event }) => ({
  id: 'synthetic_view',
  label: 'Synthetic view',
  content: <SyntheticView event={event} />,
});
