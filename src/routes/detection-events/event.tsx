import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { EventByIdPage } from '@/pages/events/:eventId';

export const Route = createFileRoute('/detection-events/event')({
  component: () => (
    <PageBoundary key="event-by-id">
      <EventByIdPage />
    </PageBoundary>
  ),
});
