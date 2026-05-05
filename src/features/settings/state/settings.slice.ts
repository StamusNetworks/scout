import { createSlice } from '@reduxjs/toolkit';

import { SettingsAPI } from '../api/settings.api';

const initialState: SettingsState = {
  enterprise: true,
};

export type SettingsState = {
  enterprise: boolean;
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      SettingsAPI.endpoints.getSystemSettings.matchFulfilled,
      (state, action) => {
        // Derived from the license matrix so the test setup can preload
        // `settings.enterprise: false` without mocking the API. Updated
        // here (not via a selector) to keep `useFeatureFlags` cheap.
        state.enterprise = action.payload.license
          ? Object.values(action.payload.license).some(
              (value) => value === true,
            )
          : false;
      },
    );
  },
});

export const settingsInitialState = initialState;
