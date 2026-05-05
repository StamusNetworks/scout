import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Permission strings used by the legacy backend. The slice currently
 * only holds this constant list; access tokens are populated by the
 * legacy auth flow and are not yet read from anywhere on the client.
 */
const initialState = {
  accessToken: '',
  refreshToken: '',
  permissions: [
    'rules.events_ryod',
    'rules.events_evebox',
    'rules.events_kibana',
    'rules.events_edit',
    'rules.events_view',
    'rules.ruleset_update_push',
    'rules.ruleset_policy_edit',
    'rules.ruleset_policy_view',
    'rules.source_edit',
    'rules.source_view',
    'rules.configuration_auth',
    'rules.configuration_edit',
    'rules.configuration_view',
  ],
};

export type AuthState = typeof initialState;

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
  },
});

export const { setAccessToken } = authSlice.actions;
export const authInitialState = initialState;
