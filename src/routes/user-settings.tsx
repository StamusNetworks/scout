import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { UserSettingsPage } from '@/pages/preferences';

export const Route = createFileRoute('/user-settings')({
  component: () => (
    <PageBoundary key="user-settings">
      <UserSettingsPage />
    </PageBoundary>
  ),
});
