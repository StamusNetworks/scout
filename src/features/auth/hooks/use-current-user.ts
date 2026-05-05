import { useGetCurrentUserQuery } from '../api/auth.api';

/**
 * Returns the currently authenticated user in domain shape (camelCase,
 * `Date` joinedAt, etc.). Wraps `useGetCurrentUserQuery` so callers
 * never see the wire DTO.
 */
export const useCurrentUser = () => useGetCurrentUserQuery();
