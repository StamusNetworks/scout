import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { isNumeric } from '@/common/lib/numbers';
import {
  addQueryFilter,
  clearQueryFilters,
} from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { useAppDispatch } from '@/store/store';

import { routes } from '../routes.config';

export const Deeplink = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
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
  }, []);
  return (
    <Navigate
      to={urls[params.get('page') as keyof typeof urls] ?? urls.dashboard}
    />
  );
};

const urls = {
  dashboard: routes.explorer,
  events: routes.events,
  detection_methods: routes.detection_methods,
  hosts: routes.hosts,
  inventory: routes.attack_surface_inventory,
};
