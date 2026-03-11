import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ExplorePage } from '@/pages/explore';

export const Route = createFileRoute('/explore')({
  component: () => (
    <PageBoundary key="explore">
      <ExplorePage />
    </PageBoundary>
  ),
});
