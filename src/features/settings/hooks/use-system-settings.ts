import { useGetSystemSettingsQuery } from '../api/settings.api';

export const useSystemSettings = (options?: {
  refetchOnFocus?: boolean;
  refetchOnReconnect?: boolean;
}) => useGetSystemSettingsQuery(undefined, options);
