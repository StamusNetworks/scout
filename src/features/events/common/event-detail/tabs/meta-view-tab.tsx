import { Tag } from '@/common/design-system/layouts/components/navigation/navigation';
import { MetaView } from '@/features/events/common/molecules/meta-view/meta-view';
import { Event } from '@/features/events/model/event';

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
