import { useGetCurrentUserQuery } from '../api/auth.api';

/**
 * Returns the currently authenticated user in domain shape (camelCase
 * fields, ISO-string `joinedAt`). Wraps `useGetCurrentUserQuery` so
 * callers never see the wire DTO.
 */
export const useCurrentUser = () => useGetCurrentUserQuery();
