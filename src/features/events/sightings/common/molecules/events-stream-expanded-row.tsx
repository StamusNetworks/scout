import { Row } from '@tanstack/react-table';

import { JsonView } from '@/common/design-system/atoms/json-view';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { Event } from '@/features/events/common/events.model';

interface EventsStreamExpandedRowProps {
  row: Row<Event>;
}
export const EventsStreamExpandedRow = ({
  row,
}: EventsStreamExpandedRowProps) => {
  return (
    <Tabs className="p-2">
      <TabsList>
        <TabsTrigger value="metadata">Metadata</TabsTrigger>
        <TabsTrigger value="json">JSON View</TabsTrigger>
      </TabsList>
      <TabsContent value="metadata"></TabsContent>
      <TabsContent value="json">
        <JsonView data={row.original} />
      </TabsContent>
    </Tabs>
  );
};
