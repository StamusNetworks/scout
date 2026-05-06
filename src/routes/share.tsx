import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { useHydrateFromShareLink } from '@/features/share';

export const Route = createFileRoute('/share')({
  component: () => (
    <PageBoundary key="share">
      <SharePage />
    </PageBoundary>
  ),
});

function SharePage() {
  useHydrateFromShareLink();
  return null;
}

export { SharePage };
