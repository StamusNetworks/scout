import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Page } from '@/common/design-system/atoms/page';
import { TogglePageContainer } from '@/features/app-shell';
import { EventDetail } from '@/features/events';

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
      <TogglePageContainer>
        <EventDetail eventId={_id} />
      </TogglePageContainer>
    </Page>
  );
}
