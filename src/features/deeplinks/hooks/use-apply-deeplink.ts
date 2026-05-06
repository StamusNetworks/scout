import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useClearFilters } from '@/features/query-filters/hooks/use-clear-filters';
import { useCreateFilter } from '@/features/query-filters/hooks/use-create-filter';

import { parseDeeplinkValue } from '../utils/parse-deeplink-value';

const PIVOT_ROUTES = {
  dashboard: '/explorer',
  events: '/detection-events',
  detection_methods: '/detection-methods',
  hosts: '/hosts',
  inventory: '/attack-surface/inventory',
} as const;

type PivotKey = keyof typeof PIVOT_ROUTES;

const resolvePivotRoute = (pageKey: string | null): string =>
  pageKey && pageKey in PIVOT_ROUTES
    ? PIVOT_ROUTES[pageKey as PivotKey]
    : PIVOT_ROUTES.dashboard;

export const useApplyDeeplink = () => {
  const navigate = useNavigate();
  const clearFilters = useClearFilters();
  const createFilter = useCreateFilter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    clearFilters();
    params.forEach((value, key) => {
      if (key === 'page') return;
      createFilter({ key, value: parseDeeplinkValue(value) });
    });
    navigate({ to: resolvePivotRoute(params.get('page')), replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount to apply the deeplink
  }, []);
};
