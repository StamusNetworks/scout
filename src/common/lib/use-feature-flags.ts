import { values } from 'ramda';

import { SystemSettings } from '@/features/user/settings/settings.model';
import { RootStateWithAPI, useAppSelector } from '@/store/store';

export const useFeatureFlags = () => {
  const enterprise = useAppSelector((state: RootStateWithAPI) => {
    const license = (
      state.API.queries['getSystemSettings(undefined)']?.data as
        | SystemSettings
        | undefined
    )?.license;
    return !!license && values(license).some((value) => value === true);
  });
  return {
    experimental: true,
    enterprise,
    operational_center: {
      doc_timeline: false,
      incidents_area_timeline: false,
    },
  };
};
