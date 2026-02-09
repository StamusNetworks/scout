import { Row } from '@tanstack/react-table';

import { Event } from '../../model/event.schema';
import {
  DetectionMethodTab,
  EventDetailTabs,
  FilesTab,
  JsonTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from '../event-detail-tabs';

export const ExpandedEventRow = ({ row }: { row: Row<Event> }) => {
  return (
    <EventDetailTabs
      event={row.original}
      variant="border"
      defaultTab="synthetic_view"
      className="p-2"
    >
      <SyntheticTab event={row.original} />
      <JsonTab event={row.original} />
      <DetectionMethodTab event={row.original} />
      <RelatedEventsTabs />
      <PcapTab event={row.original} />
      <FilesTab />
    </EventDetailTabs>
  );
};
