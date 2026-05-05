import { Navigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { isNumeric } from '@/common/lib/numbers';
import { useClearFilters } from '@/features/query-filters/use-cases/clear-filters/clear-filters';
import { useCreateFilter } from '@/features/query-filters/use-cases/create-filter/create-filter';

export const Route = createFileRoute('/deeplink')({
  component: () => (
    <PageBoundary key="deeplink">
      <DeeplinkPage />
    </PageBoundary>
  ),
});

const urls = {
  dashboard: '/explorer',
  events: '/detection-events',
  detection_methods: '/detection-methods',
  hosts: '/hosts',
  inventory: '/attack-surface/inventory',
};

function DeeplinkPage() {
  const clearFilters = useClearFilters();
  const createFilter = useCreateFilter();
  const params = new URLSearchParams(window.location.search);
  useEffect(() => {
    clearFilters();
    Array.from(params).forEach(([key, value]) => {
      if (key === 'page') return;
      const trimmedValue =
        value.startsWith('"') && value.endsWith('"')
          ? value.slice(1, -1)
          : value;
      const typedValue = isNumeric(trimmedValue)
        ? Number(trimmedValue)
        : trimmedValue;
      createFilter({ key, value: typedValue });
    });
  });
  return (
    <Navigate
      to={urls[params.get('page') as keyof typeof urls] ?? urls.dashboard}
    />
  );
}

export { DeeplinkPage as Deeplink };
