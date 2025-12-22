import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

import { SettingsAPI } from './settings.api';

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
        // We could use a selector here, but this makes the test setup cleaner, avoiding the need to wrap the renderWithProviders and mock the API.
        // And makes it easier to init store with setting.enterprise: false to create a test for CE.
        state.enterprise = Object.values(action.payload.license).some(
          (value) => value === true,
        );
      },
    );
  },
});

export const settingsInitialState = initialState;

export const selectIsEnterprise = (state: RootState) =>
  state.settings.enterprise;
