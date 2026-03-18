import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { CompromisesGraph } from '@/features/threats/compromises/use-cases/graph/entities/compromises-graph';

export const Route = createFileRoute('/_enterprise/threats/compromises/graph')({
  component: () => (
    <PageBoundary key="threats-graph">
      <CompromisesGraph />
    </PageBoundary>
  ),
});
