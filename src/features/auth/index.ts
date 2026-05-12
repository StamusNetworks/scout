/**
 * Public API for the auth bounded context. Owns the currently
 * authenticated user, session-activity tracking, and the legacy
 * permissions/token slice.
 */

export type { CurrentUser } from './model/current-user';

export { redirectToLogin } from './utils/redirect-to-login';
export { useCurrentUser } from './hooks/use-current-user';
export { useSessionActivity } from './hooks/use-session-activity';
