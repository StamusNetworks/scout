import { Tag } from '@/common/design-system/layouts/components/navigation/navigation';
import { Event } from '@/features/events/common/events.model';
import { MetaView } from '@/features/hunt/events/components/meta-view/meta-view';

import { TabComponentType } from '../event-detail-tabs.types';

export const MetaViewTab: TabComponentType<{ event: Event }> = () => null;

MetaViewTab.tabConfig = ({ event }) => ({
  id: 'meta_view',
  label: (
    <>
      Meta view <Tag className="ml-2 bg-lime-200 text-lime-900">Beta</Tag>
    </>
  ),
  content: <MetaView event={event} />,
});
