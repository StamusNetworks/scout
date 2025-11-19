import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { SettingsAPI } from '../settings/settings.api';

const initialState = {
  tenant: undefined,
  tenantsList: [],
  multitenancy: undefined,
} as TenancyState;

type TenancyState = {
  tenant: number | undefined;
  tenantsList: Tenant[];
  multitenancy: boolean | undefined;
};

export type Tenant = {
  tenantId: number;
  name: string;
};

const setTenantState = (state: TenancyState, number: number) => {
  state.tenant = number;
  localStorage.setItem('tenant', number.toString());
};

export const tenancySlice = createSlice({
  name: 'tenancy',
  initialState,
  reducers: {
    setTenant: (state, action: PayloadAction<number>) => {
      setTenantState(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        SettingsAPI.endpoints.getGlobalSettings.matchFulfilled,
        (state, action) => {
          state.multitenancy = action.payload.multi_tenancy;
          if (!action.payload.multi_tenancy) {
            setTenantState(state, 0);
          }
        },
      )
      .addMatcher(
        SettingsAPI.endpoints.getTenantsList.matchFulfilled,
        (state, action) => {
          state.tenantsList = action.payload;

          const tenant = localStorage.getItem('tenant');

          // no tenants in list: set to 0
          if (!action.payload?.length) {
            setTenantState(state, 0);
            return;
          }
          // tenant in localStorage exists in tenants list
          if (
            tenant &&
            action.payload.find((t) => t.tenantId === parseInt(tenant))
          ) {
            setTenantState(state, parseInt(tenant));
            return;
          }
          // no tenant in localStorage, or if tenant does not exist in tenants list, set to first tenant
          setTenantState(state, action.payload[0].tenantId);
          return;
        },
      );
  },
});

export const { setTenant } = tenancySlice.actions;
export const tenancyInitialState = initialState;
