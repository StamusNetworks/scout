import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { useApplyDeeplink } from '@/features/deeplinks';

export const Route = createFileRoute('/deeplink')({
  component: () => (
    <PageBoundary key="deeplink">
      <DeeplinkPage />
    </PageBoundary>
  ),
});

function DeeplinkPage() {
  useApplyDeeplink();
  return null;
}

export { DeeplinkPage as Deeplink };
