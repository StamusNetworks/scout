import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { CompromisesEntities } from '@/features/threats/compromises/use-cases/entities/entities/compromises-entities';

export const Route = createFileRoute(
  '/_enterprise/threats/compromises/entities',
)({
  component: () => (
    <PageBoundary key="threats-entities">
      <CompromisesEntities />
    </PageBoundary>
  ),
});
