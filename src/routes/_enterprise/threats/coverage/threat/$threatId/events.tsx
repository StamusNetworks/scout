import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatEvents } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/threat/$threatId/events',
)({
  component: () => {
    const { threatId } = useParams({ strict: false }) as { threatId: string };
    return (
      <PageBoundary key="threat-by-id-events">
        <ThreatEvents threatId={threatId} />
      </PageBoundary>
    );
  },
});
