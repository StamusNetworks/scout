import { Row } from '@tanstack/react-table';

import { Event } from '../../model/event.schema';
import {
  DetectionMethodTab,
  EventDetailTabs,
  FilesTab,
  JsonTab,
  MetaViewTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from '../event-detail-tabs';

export const ExpandedEventRow = ({ row }: { row: Row<Event> }) => {
  return (
    <EventDetailTabs
      event={row.original}
      variant="border"
      defaultTab="meta_view"
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
