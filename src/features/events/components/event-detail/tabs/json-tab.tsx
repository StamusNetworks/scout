import { JsonView } from '@/common/design-system/atoms/json-view';
import { Event } from '@/features/events/model/event';

import { TabComponentType } from '../event-detail-tabs.types';

export const JsonTab: TabComponentType<{ event: Event }> = () => null;

JsonTab.tabConfig = ({ event }) => ({
  id: 'json_view',
  label: 'JSON View',
  content: <JsonView data={event} />,
});
