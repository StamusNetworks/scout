import { useGetGlobalSettingsQuery } from '../api/settings.api';

export const useGlobalSettings = (options?: {
  refetchOnFocus?: boolean;
  refetchOnReconnect?: boolean;
}) => useGetGlobalSettingsQuery(undefined, options);
