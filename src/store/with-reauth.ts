import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';

/**
 * Handler invoked when an authenticated request returns 401/403.
 * Returns `true` if a navigation was initiated and the latch should latch
 * shut, `false` if the handler short-circuited (e.g. dev mode) so subsequent
 * 401/403s remain visible. Returning `void` is treated as `true` for
 * back-compat with handlers that always navigate.
 */
type UnauthenticatedHandler = () => boolean | void;

let onUnauthenticated: UnauthenticatedHandler = () => {};
let hasRedirected = false;

export const setOnUnauthenticated = (handler: UnauthenticatedHandler) => {
  onUnauthenticated = handler;
};

/** @internal — for tests only. */
export const resetReauthForTests = () => {
  hasRedirected = false;
  onUnauthenticated = () => {};
};

const isUnauthenticatedStatus = (status: unknown) =>
  status === 401 || status === 403 || status === '401' || status === '403';

const isUnauthenticatedError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const errorRecord = error as Record<string, unknown>;
  return (
    isUnauthenticatedStatus(errorRecord.status) ||
    isUnauthenticatedStatus(errorRecord.originalStatus)
  );
};

export const withReauth = (inner: BaseQueryFn): BaseQueryFn => {
  return async (...args) => {
    const result = await inner(...args);
    if (
      result &&
      typeof result === 'object' &&
      'error' in result &&
      isUnauthenticatedError(result.error) &&
      !hasRedirected
    ) {
      // Only flip the latch if the handler reports it actually navigated.
      // This keeps 401/403 handling alive in dev mode (where the helper
      // short-circuits) and any future case where navigation is refused.
      const didNavigate = onUnauthenticated() !== false;
      if (didNavigate) {
        hasRedirected = true;
      }
    }
    return result;
  };
};
