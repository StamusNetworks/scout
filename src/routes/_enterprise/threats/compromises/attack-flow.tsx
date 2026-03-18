import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { AttackFlowView } from '@/features/threats/compromises/use-cases/attack-flow/entities/attack-flow-view';

export const Route = createFileRoute(
  '/_enterprise/threats/compromises/attack-flow',
)({
  component: () => (
    <PageBoundary key="threats-attack-flow">
      <AttackFlowView />
    </PageBoundary>
  ),
});
