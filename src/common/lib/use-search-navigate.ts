import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

export type SearchNavigate = (opts: {
  search: (prev: Record<string, unknown>) => Record<string, unknown>;
  replace?: boolean;
}) => void;

/**
 * Wraps `useNavigate()` so callers can pass a search-only updater without
 * fighting TanStack Router's per-route navigate overloads. Returns a stable
 * function reference — safe as a dep in `useEffect`/`useCallback` and as a
 * prop to memoised children.
 */
export const useSearchNavigate = (): SearchNavigate => {
  const navigate = useNavigate();
  return useCallback<SearchNavigate>(
    (opts) => {
      void navigate(opts as Parameters<typeof navigate>[0]);
    },
    [navigate],
  );
};
