import { Navigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { isNumeric } from '@/common/lib/numbers';
import {
  addQueryFilter,
  clearQueryFilters,
} from '@/features/filtering/filters/query-filters/query-filters.store';
import { useAppDispatch } from '@/store/store';

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
  const dispatch = useAppDispatch();
  const params = new URLSearchParams(window.location.search);
  useEffect(() => {
    dispatch(clearQueryFilters());
    Array.from(params).forEach(([key, value]) => {
      if (key === 'page') return;
      const trimmedValue =
        value.startsWith('"') && value.endsWith('"')
          ? value.slice(1, -1)
          : value;
      const typedValue = isNumeric(trimmedValue)
        ? Number(trimmedValue)
        : trimmedValue;
      dispatch(addQueryFilter({ key, value: typedValue }));
    });
  });
  return (
    <Navigate
      to={urls[params.get('page') as keyof typeof urls] ?? urls.dashboard}
    />
  );
}

export { DeeplinkPage as Deeplink };
