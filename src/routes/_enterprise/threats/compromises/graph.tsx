import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatGraph } from '@/features/threats';

export const Route = createFileRoute('/_enterprise/threats/compromises/graph')({
  component: () => (
    <PageBoundary key="threats-graph">
      <ThreatGraph kind="compromise" />
    </PageBoundary>
  ),
});
