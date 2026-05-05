import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { SettingsAPI } from '@/features/settings/api/settings.api';

import { TenancyAPI } from '../api/tenancy.api';
import type { Tenant } from '../model/tenant';

export type TenancyState = {
  tenant: number | undefined;
  tenantsList: Tenant[];
  multitenancy: boolean | undefined;
};

const initialState: TenancyState = {
  tenant: undefined,
  tenantsList: [],
  multitenancy: undefined,
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
          state.multitenancy = action.payload.multiTenancy;
          if (!action.payload.multiTenancy) {
            setTenantState(state, 0);
          }
        },
      )
      .addMatcher(
        TenancyAPI.endpoints.getTenantsList.matchFulfilled,
        (state, action) => {
          state.tenantsList = action.payload;

          const tenant = localStorage.getItem('tenant');

          if (!action.payload?.length) {
            setTenantState(state, 0);
            return;
          }
          if (
            tenant &&
            action.payload.find((t) => t.tenantId === parseInt(tenant))
          ) {
            setTenantState(state, parseInt(tenant));
            return;
          }
          setTenantState(state, action.payload[0].tenantId);
          return;
        },
      );
  },
});

export const { setTenant } = tenancySlice.actions;
export const tenancyInitialState = initialState;
