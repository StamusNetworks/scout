import { getConfig } from '@/config';

type RedirectVariant = 'login' | 'logout';

/**
 * The path the user is currently viewing within the SPA, stripped of the
 * BASE_URL prefix so it can be appended to the backend login URL without
 * doubling the SPA mount point.
 */
const getCurrentSpaPath = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const { pathname, search, hash } = window.location;
  const internal = pathname.startsWith(baseUrl)
    ? pathname.slice(baseUrl.length)
    : pathname.replace(/^\//, '');
  return `${internal}${search}${hash}`;
};

const buildUrl = (variant: RedirectVariant) => {
  const apiUrl = getConfig()?.apiUrl ?? '';
  if (variant === 'logout') {
    return `${apiUrl}/accounts/logout/`;
  }
  return `${apiUrl}/accounts/login${import.meta.env.BASE_URL}${getCurrentSpaPath()}`;
};

/**
 * Navigates the browser to the backend's login/logout page.
 *
 * Returns `true` if a navigation was initiated, `false` if the redirect was
 * suppressed (currently: only in `VITE_APP_MODE === 'development'`). Callers
 * that need to coalesce concurrent redirect attempts should branch on the
 * return value so dev-mode short-circuits don't leave the caller in a
 * "navigation in flight" state forever.
 */
export const redirectToLogin = ({
  variant,
}: {
  variant: RedirectVariant;
}): boolean => {
  const target = buildUrl(variant);

  if (import.meta.env.VITE_APP_MODE === 'development') {
    // eslint-disable-next-line no-console
    console.info('[auth] suppressed redirect in development mode →', target);
    return false;
  }

  window.location.href = target;
  return true;
};
