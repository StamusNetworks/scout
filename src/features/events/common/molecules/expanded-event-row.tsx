import { Row } from '@tanstack/react-table';

import { Event } from '@/features/hunt/events/model/event.schema';
import { selectDefaultEventDetailTab } from '@/features/ui/preferences/preferences.slice';
import { useAppSelector } from '@/store/store';

import {
  DetectionMethodTab,
  EventDetailTabs,
  FilesTab,
  JsonTab,
  MetaViewTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from '../event-detail';

export const ExpandedEventRow = ({ row }: { row: Row<Event> }) => {
  const defaultTab = useAppSelector(selectDefaultEventDetailTab);
  return (
    <EventDetailTabs
      event={row.original}
      variant="border"
      defaultTab={defaultTab}
      className="p-2"
    >
      <MetaViewTab event={row.original} />
      <SyntheticTab event={row.original} />
      <JsonTab event={row.original} />
      <DetectionMethodTab event={row.original} />
      <RelatedEventsTabs />
      <PcapTab event={row.original} />
      <FilesTab />
    </EventDetailTabs>
  );
};
