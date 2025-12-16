import { createSelector } from '@reduxjs/toolkit';
import { values } from 'ramda';

import { RootStateWithAPI, useAppSelector } from '@/store/store';

export const useFeatureFlags = () => {
  const enterprise = useAppSelector(selectIsEnterprise);
  return {
    experimental: true,
    enterprise,
    operational_center: {
      doc_timeline: false,
      incidents_area_timeline: false,
    },
  };
};

export const selectSystemSettings = (state: RootStateWithAPI) =>
  state.API.queries['getSystemSettings(undefined)']?.data;

export const selectIsEnterprise = createSelector(
  [selectSystemSettings],
  (systemSettings) =>
    !!systemSettings?.license &&
    values(systemSettings.license).some((value) => value === true),
);
