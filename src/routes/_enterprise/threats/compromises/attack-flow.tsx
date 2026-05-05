import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { CompromiseAttackFlow } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/compromises/attack-flow',
)({
  component: () => (
    <PageBoundary key="threats-attack-flow">
      <CompromiseAttackFlow />
    </PageBoundary>
  ),
});
