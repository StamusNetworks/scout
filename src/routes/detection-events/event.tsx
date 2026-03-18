import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Page, PageContainer } from '@/common/design-system/atoms/page';
import { EventDetail } from '@/features/events/common/event-detail/entities/event-detail';

const searchSchema = z.object({
  _id: z.string(),
});

export const Route = createFileRoute('/detection-events/event')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="event-by-id">
      <EventDetailPage />
    </PageBoundary>
  ),
});

function EventDetailPage() {
  const { _id } = Route.useSearch();

  return (
    <Page>
      <PageContainer>
        <EventDetail eventId={_id} />
      </PageContainer>
    </Page>
  );
}
